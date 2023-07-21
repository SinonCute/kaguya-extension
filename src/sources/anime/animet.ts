import AnimeSource from "@src/core/AnimeSource";
import Episode, { EpisodeType } from "@src/core/Episode";
import { SearchResultType } from "@src/core/SearchResult";
import { VideoFormat } from "@src/core/Video";
import VideoContainer, { VideoContainerType } from "@src/core/VideoContainer";
import VideoServer, { VideoServerType } from "@src/core/VideoServer";
import { DataWithExtra } from "@src/types/utils";
import { Wise_EvalDecode } from "@src/unpackers/wise";
import { isValidUrl, parseBetween, serialize } from "@src/utils";
import { evalScript } from "@src/utils/eval";
import { load } from "cheerio";

export default class AnimeT extends AnimeSource {
  constructor() {
    super({
      name: "AnimeT",
      id: "animet",
      languages: ["Vietnamese"],
      isNSFW: false,
      url: "https://animet.net",
      quality: ["720p"],
      logo: "https://animet.net/Theme_Anime/img/favicon.ico",
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
              value: "https://animet.net",
            },
            {
              header: "Origin",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "https://animet.net",
            },
          ],
        },
        condition: {
          requestDomains: ["api.anime3s.com", "animet.net"],
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
          ],
        },
      },
      {
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: "Referer",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "https://api.anime3s.com/",
            },
            {
              header: "Origin",
              operation: chrome.declarativeNetRequest.HeaderOperation.SET,
              value: "https://api.anime3s.com/",
            },
          ],
        },
        condition: {
          regexFilter: "^https://(.*)/video.mp4(.*)",
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MEDIA],
        },
      },
    ];
  }

  async getAnimeId(anilist: any): Promise<DataWithExtra<string>> {
    return {
      data: "5184",
    };
  }

  async loadEpisodes(
    animeId: string,
    extraData?: Record<string, string>
  ): Promise<EpisodeType[]> {
    return [
      Episode({
        number: "1",
        id: "150312",
        title: "I Like You. Please Go Out With Me",
      }),
      Episode({
        number: "2",
        id: "150775",
        title: "For You. It's a Spare Triangle Chocolate Pie",
      }),
      Episode({
        number: "3",
        id: "150972",
        title: "Episode 3",
      }),
    ];
  }

  async loadVideoServers(
    episodeLink: string,
    extraData?: Record<string, string>
  ): Promise<VideoServerType[]> {
    return [
      VideoServer({
        embed: null,
        name: "FB",
        extraData: {
          id: "5184",
          ep: "150972",
          sv: "0",
          endpoint: "player",
        },
      }),
      VideoServer({
        embed: null,
        name: "GG",
        extraData: {
          id: "5184",
          ep: "150972",
          sv: "gp-0",
          endpoint: "player_streamvn",
        },
      }),
    ];
  }

  async loadVideoContainer(
    videoServer: VideoServerType
  ): Promise<VideoContainerType> {
    const { extraData } = videoServer;

    const { endpoint, id, ep, sv } = extraData;

    const response = await fetch(`https://animet.net/ajax/${endpoint}`, {
      method: "post",
      body: serialize({
        id,
        ep,
        sv,
      }),
      headers: {
        Origin: "https://animet.net",
        Referer: "https://animet.net",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });

    const text = await response.text();

    const $ = load(text);

    const src = $("iframe").attr("src");

    if (!isValidUrl(src)) return null;

    const iframeResponse = await fetch(src, {
      headers: {
        referer: "https://animet.net",
      },
    });
    const iframeText = await iframeResponse.text();

    const packed = ";eval" + parseBetween(iframeText, ";eval", "'));") + "'));";

    const unpacked = await Wise_EvalDecode(packed);

    const sources = await evalScript<
      { file: string; label: string; type: "mp4" }[]
    >(parseBetween(unpacked, "{sources:", ",image"));

    return VideoContainer({
      videos: sources
        .filter((source) => source.file)
        .map((source) => ({
          file: {
            url: source.file,
            // headers: {
            //   referer: "https://api.anime3s.com/",
            //   host: "lbs.blogtool.net",
            // },
          },
          format: VideoFormat.CONTAINER,
          quality: source.label,
        })),
    });
  }

  async search(query: string): Promise<SearchResultType[]> {
    return [];
  }
}
