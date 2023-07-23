import AnimeSource from "@src/core/AnimeSource";
import { EpisodeType } from "@src/core/Episode";
import FileUrl from "@src/core/FileUrl";
import { SearchResultType } from "@src/core/SearchResult";
import Video from "@src/core/Video";
import VideoContainer, { VideoContainerType } from "@src/core/VideoContainer";
import { VideoServerType } from "@src/core/VideoServer";
import { DataWithExtra } from "@src/types/utils";
import { parseBetween, parseNumberFromString, serialize } from "@src/utils";
import { evalScript } from "@src/utils/eval";
import { load } from "cheerio";

type Server = {
  link: string;
  name: string;
  id: number;
  sort: number;
};

export default class AnimeTVN extends AnimeSource {
  csrf: string;

  constructor() {
    super({
      name: "AnimeTVN",
      id: "tvn",
      languages: ["Vietnamese"],
      isNSFW: false,
      url: "https://animetvn.live",
      quality: ["720p"],
      logo: "https://animetvn.live/images/logo.png",
    });

    this.rules = [
      {
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: "User-Agent",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "yayaya",
            },
          ],
        },
        condition: {
          requestDomains: ["api-plhq.playhbq.xyz"],
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
          ],
        },
      },
      {
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          responseHeaders: [
            {
              header: "Access-Control-Allow-Origin",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "*",
            },
            {
              header: "Access-Control-Allow-Methods",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "PUT, GET, HEAD, POST, DELETE, OPTIONS",
            },
          ],
        },
        condition: {
          regexFilter: "^https://(.*)/stream/v5/(.*).html",
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
          ],
        },
      },
      {
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          responseHeaders: [
            {
              header: "Access-Control-Allow-Origin",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "*",
            },
            {
              header: "Access-Control-Allow-Methods",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "PUT, GET, HEAD, POST, DELETE, OPTIONS",
            },
          ],
        },
        condition: {
          requestDomains: ["m3u8-plhq.playhbq.xyz"],
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
          ],
        },
      },
    ];
  }

  async getAnimeId(anilist: any): Promise<DataWithExtra<string>> {
    let data = JSON.stringify({
      query: `query {
        animeMapping(id: ${anilist.id}, providerId: "AnimeTVN") {
            animeId
            mediaId
            providerId
        }
    }`,
    });

    let config = {
      method: "post",
      url: "https://api-vn.karyl.live/graphql",
      headers: {
        "User-Agent": "Karyl/1.0.0",
        "Content-Type": "application/json",
      },
      body: data,
    };

    const response = await fetch(config.url, config);
    const json = (await response.json()) as {
      data: {
        animeMapping: {
          animeId: string;
          mediaId: string;
          providerId: string;
        };
      };
    };

    return {
      data: json?.data?.animeMapping?.mediaId,
    };
  }

  async loadEpisodes(animeId: string): Promise<EpisodeType[]> {
    const response = await fetch(
      `https://animetvn.live/thong-tin-phim/f${animeId}-a.html`
    );
    const text = await response.text();
    const $old = load(text);

    const playUrl = $old(".play-now").attr("href");

    const watchResponse = await fetch(playUrl);
    const watchText = await watchResponse.text();

    const $new = load(watchText);

    const episodes: EpisodeType[] = $new(".svep")
      .toArray()
      .flatMap((serverEl) => {
        const $serverEl = $new(serverEl);

        const serverName = $serverEl.find(".svname").text().trim();

        const episodeList: EpisodeType[] = $serverEl
          .find("a")
          .toArray()
          .map((episodeEl) => {
            const $el = $new(episodeEl);

            const sourceEpisodeId = $el.attr("id").split("_")[1]?.toString();
            const name = $el.text().trim();
            const number = parseNumberFromString(name, "Full")?.toString();

            if (!sourceEpisodeId || number) return null;

            return {
              section: serverName,
              id: sourceEpisodeId,
              number: parseNumberFromString(name)?.toString(),
            };
          })
          .filter(Boolean);

        return episodeList;
      });

    return episodes;
  }

  async loadVideoServers(episodeId: string): Promise<VideoServerType[]> {
    await this.getCookiesAndCSRF();

    const allowServers = ["TVN", "FB", "LOT"];

    type Response = {
      success: boolean;
      links: Server[];
    };

    const response = await fetch("https://animetvn.live/ajax/getExtraLinks", {
      method: "post",
      body: `epid=${episodeId}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-csrf-token": this.csrf,
      },
    });
    const data = (await response.json()) as Response;

    if (!data?.success) return [];

    const servers: VideoServerType[] = data?.links
      .map((link) => {
        const name = link.name.split("-")[1];

        return {
          embed: "",
          name,
          extraData: {
            id: link.id.toString(),
            link: link.link,
          },
        };
      })
      .filter((server) => allowServers.includes(server.name));

    return servers;
  }

  async getCookiesAndCSRF() {
    if (this.csrf) return this.csrf;

    const response = await fetch("https://animetvn.live");
    const data = await response.text();

    const $ = load(data);

    const csrf = $("meta[name='csrf-token']").attr("content");

    this.csrf = csrf;
  }

  async loadVideoContainer(
    server: VideoServerType,
    extraData?: Record<string, string>
  ): Promise<VideoContainerType> {
    const { id, link } = extraData;

    const response = await fetch("https://animetvn.live/ajax/getExtraLink", {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-csrf-token": this.csrf,
      },
      body: serialize({
        id,
        link,
      }),
    });

    const source = (await response.json()) as {
      link: string;
    };

    if (server.name === "TVN") {
      const response = await fetch(source.link);

      const data = await response.text();

      const idUser = parseBetween(data, 'var idUser = "', '"');
      const idfile = parseBetween(data, 'var idfile = "', '"');

      const postUrl = `https://api-plhq.playhbq.xyz/apiv4/${idUser}/${idfile}`;

      const streamResponse = await fetch(postUrl, {
        method: "post",
        body: `referrer=${encodeURIComponent(
          "https://animetvn.live"
        )}&typeend=html`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const streamData = await streamResponse.json();

      if (!streamData?.data) {
        return null;
      }

      return VideoContainer({
        videos: [Video({ file: FileUrl({ url: streamData?.data }) })],
      });
    }

    if (server.name === "FB") {
      const response = await fetch(source.link);
      const data = await response.text();
      const html = data.replace(/(\r\n|\n|\r)/gm, "").replace(/ +/g, "");

      const sources = await evalScript<
        { file: string; label: string; type: "mp4" }[]
      >(parseBetween(html, '"sources":', ",height"));

      return VideoContainer({
        videos: sources.map((source) =>
          Video({ file: FileUrl({ url: source.file }) })
        ),
      });
    }

    if (server.name === "LOT") {
      const response = await fetch(source.link);
      const data = await response.text();

      const base64 = parseBetween(data, "Player('", "')");

      const decodedBase64 = atob(base64);

      return VideoContainer({
        videos: [Video({ file: FileUrl({ url: decodedBase64 }) })],
      });
    }
  }

  async search(query: string): Promise<SearchResultType[]> {
    return [];
  }
}
