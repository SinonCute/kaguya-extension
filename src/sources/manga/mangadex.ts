import { ChapterType } from "@src/core/Chapter";
import { EpisodeType } from "@src/core/Episode";
import { FileUrlType } from "@src/core/FileUrl";
import MangaSource from "@src/core/MangaSource";
import { SearchResultType } from "@src/core/SearchResult";
import { DataWithExtra } from "@src/types/utils";

declare module MangaDexResponse {
  export interface Image {
    hash: string;
    data: string[];
    dataSaver: string[];
  }

  export interface ImageResponse {
    result: string;
    baseUrl: string;
    chapter: Image;
  }

  export interface Attributes {
    volume: string;
    chapter: string;
    title: string;
    translatedLanguage: string;
    externalUrl: string;
    publishAt: Date;
    readableAt: Date;
    createdAt: Date;
    updatedAt: Date;
    pages: number;
    version: number;
  }

  export interface Title {
    en: string;
  }

  export interface AltTitle {
    ko: string;
    en: string;
    "zh-ro": string;
    zh: string;
    ru: string;
    "es-la": string;
    ja: string;
    "ko-ro": string;
    "ja-ro": string;
    vi: string;
    es: string;
    id: string;
    fr: string;
    "pt-br": string;
    ar: string;
    "zh-hk": string;
    uk: string;
    cs: string;
    pl: string;
    lt: string;
    fa: string;
    hi: string;
    ne: string;
    mn: string;
    tr: string;
    kk: string;
  }

  export interface Description {
    en: string;
    ru: string;
    zh: string;
    "pt-br": string;
    vi: string;
    es: string;
    tr: string;
    fr: string;
    ja: string;
    ko: string;
    th: string;
    "zh-hk": string;
    ar: string;
    id: string;
    it: string;
    kk: string;
    pl: string;
    uk: string;
  }

  export interface Links {
    engtl: string;
    ap: string;
    mu: string;
    nu: string;
    raw: string;
    al: string;
    bw: string;
    kt: string;
    amz: string;
    ebj: string;
    mal: string;
    cdj: string;
  }

  export interface Name {
    en: string;
  }

  export interface Attributes3 {
    name: Name;
    group: string;
    version: number;
  }

  export interface Tag {
    id: string;
    type: string;
    attributes: Attributes3;
    relationships: any[];
  }

  export interface Attributes2 {
    title: Title;
    altTitles: AltTitle[];
    description: Description;
    isLocked: boolean;
    links: Links;
    originalLanguage: string;
    lastVolume: string;
    lastChapter: string;
    publicationDemographic: string;
    status: string;
    year?: number;
    contentRating: string;
    tags: Tag[];
    state: string;
    chapterNumbersResetOnNewVolume: boolean;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    availableTranslatedLanguages: string[];
    latestUploadedChapter: string;
  }

  export interface Relationship {
    id: string;
    type: string;
    attributes: Attributes2;
  }

  export interface Datum {
    id: string;
    type: string;
    attributes: Attributes;
    relationships: Relationship[];
  }

  export interface ChapterResponse {
    result: string;
    response: string;
    data: Datum[];
    limit: number;
    offset: number;
    total: number;
  }
}

export default class MangaDex extends MangaSource {
  constructor() {
    super({
      name: "MangaDex",
      id: "mangadex",
      languages: ["English"],
      isNSFW: false,
      url: "https://mangadex.org",
      logo: "https://mangadex.org/favicon.ico",
    });
  }

  async getMangaId(anilist: any): Promise<DataWithExtra<string>> {
    const response = await fetch(
      `https://raw.githubusercontent.com/bal-mackup/mal-backup/master/anilist/manga/${anilist.id}.json`
    );
    const json = await response.json();

    const mangadex: Record<string, string> = json?.Sites?.Mangadex;

    if (!mangadex) return;

    const mangadexId = Object.keys(mangadex)[0];

    return {
      data: mangadexId,
    };
  }

  async loadChapters(mangaId: string): Promise<ChapterType[]> {
    const chapters = [];
    const LIMIT = 500;

    const get = async (offset = 0) => {
      const response = await fetch(
        `https://api.mangadex.org/manga/${mangaId}/feed?limit=${LIMIT}&order[volume]=desc&order[chapter]=desc&offset=${offset}&translatedLanguage[]=en`
      );
      const data = (await response.json()) as MangaDexResponse.ChapterResponse;

      if (!data?.data?.length) return [];

      const composedChapters: EpisodeType[] = [];

      for (const chapter of data.data) {
        if (
          chapter?.attributes?.translatedLanguage !== "en" ||
          chapter?.attributes?.externalUrl !== null
        ) {
          continue;
        }

        if (
          chapters.some(
            (composedChapter) =>
              composedChapter.number === chapter.attributes.chapter
          )
        ) {
          continue;
        }

        if (
          composedChapters.some(
            (composedChapter) =>
              composedChapter.number === chapter.attributes.chapter
          )
        ) {
          continue;
        }

        composedChapters.push({
          id: chapter.id,
          number: chapter.attributes.chapter,
          title: chapter.attributes.title,
        });
      }

      chapters.push(...(composedChapters || []));

      if (offset * LIMIT < data.total) {
        return get(offset + 1);
      }
    };

    await get();

    return chapters;
  }

  async loadImages(chapterId: string): Promise<FileUrlType[]> {
    try {
      const response = await fetch(
        `https://api.mangadex.org//at-home/server/${chapterId}`
      );
      const data = (await response.json()) as MangaDexResponse.ImageResponse;

      if (!data?.chapter?.data?.length) return [];

      const images: FileUrlType[] = data.chapter.data.map((hash) => ({
        url: `${data.baseUrl}/data/${data.chapter.hash}/${hash}`,
        headers: {
          referer: "https://mangadex.org/",
        },
      }));

      return images;
    } catch (err) {
      return [];
    }
  }

  async search(query: string): Promise<SearchResultType[]> {
    return [];
  }
}
