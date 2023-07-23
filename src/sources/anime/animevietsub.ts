import AnimeSource from "@src/core/AnimeSource";
import { EpisodeType } from "@src/core/Episode";
import FileUrl from "@src/core/FileUrl";
import { SearchResultType } from "@src/core/SearchResult";
import Video from "@src/core/Video";
import VideoContainer, { VideoContainerType } from "@src/core/VideoContainer";
import { VideoServerType } from "@src/core/VideoServer";
import { DataWithExtra } from "@src/types/utils";
import { parseNumberFromString } from "@src/utils";
import { load } from "cheerio";

export default class AnimeVietSub extends AnimeSource {
  constructor() {
    super({
      name: "AnimeVietSub",
      id: "avs",
      languages: ["Vietnamese"],
      isNSFW: false,
      url: "https://animevietsub.moe",
      quality: ["720p"],
      logo: "https://cdn.animevietsub.moe/data/logo/logoz.png",
    });

    this.rules = [
      {
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: "Referer",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "https://animevietsub.moe",
            },
            {
              header: "Origin",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "https://animevietsub.moe",
            },
          ],
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
          requestDomains: [
            "storage.googleapiscdn.com",
            "lh3.googleusercontent.com",
          ],
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
            chrome.declarativeNetRequest.ResourceType.MEDIA,
          ],
        },
      },
    ];
  }

  async getAnimeId(anilist: any): Promise<DataWithExtra<string>> {
    let data = JSON.stringify({
      query: `query {
        animeMapping(id: ${anilist.id}, providerId: "AnimeVietsub") {
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
      `https://animevietsub.moe/phim/a-a${animeId}/xem-phim.html`
    );
    const text = await response.text();

    const $ = load(text);

    const episodes: EpisodeType[] = $(".episode a")
      .toArray()
      .map((episodeEl) => {
        const $el = $(episodeEl);

        const name = $el.attr("title");
        const number = parseNumberFromString(name, "Full").toString();
        const id = $el.data("id").toString();

        if (!name || !id) return;

        return { title: name, number, id };
      })
      .filter((a) => a);

    return episodes;
  }

  async loadVideoServers(episodeId: string): Promise<VideoServerType[]> {
    const response = await fetch(
      `https://animevietsub.moe/ajax/player?v=2019a`,
      {
        body: `episodeId=${episodeId}&backup=1`,
        redirect: "manual",
        method: "post",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );
    const data = await response.json();

    const $ = load(data?.html);

    const servers: VideoServerType[] = $("a")
      .toArray()
      .filter((el) => $(el).data("play") === "api")
      .map((el) => {
        const $el = $(el);

        const id = $el.data("id") as string;
        const hash = $el.data("href") as string;
        const name = $el.text().trim();

        return { name, extraData: { id, hash }, embed: "" };
      });

    return servers;
  }

  async loadVideoContainer(
    _: VideoServerType,
    extraData?: Record<string, string>
  ): Promise<VideoContainerType> {
    const { id, hash } = extraData;

    const response = await fetch(
      `https://animevietsub.moe/ajax/player?v=2019a`,
      {
        body: `link=${hash}&id=${id}`,
        redirect: "manual",
        method: "post",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );
    const data = await response.json();

    const sources: { file: string; label?: string; type: string }[] = data.link;

    return VideoContainer({
      videos: sources.map((source) =>
        Video({
          file: FileUrl({
            url: !source.file.includes("https")
              ? `https://${source.file}`
              : source.file,
          }),
          quality: source.label,
        })
      ),
    });
  }

  async search(query: string): Promise<SearchResultType[]> {
    return [];
  }
}

const urlToId = (url: string) => {
  const splitted = url.split("/").filter((a) => a);
  const lastSplit = splitted[splitted.length - 1];

  return lastSplit.split("-").slice(-1)[0].split("a")[1];
};
