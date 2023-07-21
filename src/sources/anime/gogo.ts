import AnimeSource from "@src/core/AnimeSource";
import { EpisodeType } from "@src/core/Episode";
import FileUrl, { FileUrlType } from "@src/core/FileUrl";
import { SearchResultType } from "@src/core/SearchResult";
import Video, { VideoFormat, VideoType } from "@src/core/Video";
import VideoContainer, { VideoContainerType } from "@src/core/VideoContainer";
import VideoServer, { VideoServerType } from "@src/core/VideoServer";
import gogoExtractor from "@src/extractors/gogo";
import { DataWithExtra } from "@src/types/utils";
import { Wise_EvalDecode } from "@src/unpackers/wise";
import {
  isValidUrl,
  parseBetween,
  parseNumberFromString,
  serialize,
} from "@src/utils";
import { evalScript } from "@src/utils/eval";
import { load } from "cheerio";

export default class Gogo extends AnimeSource {
  constructor() {
    super({
      name: "Gogo",
      id: "gogo",
      languages: ["English"],
      isNSFW: false,
      url: "https://www4.gogoanimes.fi",
      quality: ["720p"],
      logo: "https://cdn.gogocdn.net/files/gogo/img/favicon.ico",
    });
  }

  async getAnimeId(anilist: any): Promise<DataWithExtra<string>> {
    const response = await fetch(
      `https://raw.githubusercontent.com/bal-mackup/mal-backup/master/anilist/anime/${anilist.id}.json`
    );
    const json = await response.json();

    const gogoMap: Record<string, string> = json?.Sites?.Gogoanime;

    if (!gogoMap) return;

    const gogoId = Object.keys(gogoMap)[0];

    return {
      data: gogoId,
    };
  }

  async loadEpisodes(animeId: string): Promise<EpisodeType[]> {
    const animeDetailsResponse = await fetch(
      `https://www4.gogoanimes.fi/category/${animeId}`
    );
    const animeDetailsText = await animeDetailsResponse.text();

    const $animeDetails = load(animeDetailsText);

    const sourceAnimeId = $animeDetails("#movie_id").attr("value");

    if (!sourceAnimeId) return [];

    const response = await fetch(
      `https://ajax.gogo-load.com/ajax/load-list-episode?ep_start=0&ep_end=10000&id=${sourceAnimeId}`
    );
    const responseText = await response.text();

    const $ = load(responseText);

    const episodeList: EpisodeType[] = $("#episode_related li")
      .toArray()
      .map((el) => {
        const id = $(el).find("a").attr("href").trim().replace("/", "");

        const number = parseNumberFromString(
          $(el).find(".name").text()
        ).toString();

        return {
          id,
          number,
        };
      });

    return episodeList.sort((a, b) => Number(a.number) - Number(b.number));
  }

  async loadVideoServers(
    episodeId: string,
    extraData?: Record<string, string>
  ): Promise<VideoServerType[]> {
    return [
      VideoServer({ embed: "", name: "default", extraData: { episodeId } }),
    ];
  }

  async loadVideoContainer(
    videoServer: VideoServerType
  ): Promise<VideoContainerType> {
    const episodeId = videoServer?.extraData?.episodeId;

    if (!episodeId) return null;

    const { Referer, sources, sources_bk } = await gogoExtractor(episodeId);

    const videos: VideoType[] = [...sources, ...sources_bk].map((source) => {
      return Video({
        file: FileUrl({ url: source.file, headers: { referer: Referer } }),
        format: VideoFormat.CONTAINER,
        quality: source.label,
      });
    });

    if (!videos?.length) return null;

    return VideoContainer({ videos });
  }

  async search(query: string): Promise<SearchResultType[]> {
    return [];
  }
}
