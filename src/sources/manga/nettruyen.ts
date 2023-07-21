import Chapter, { ChapterType } from "@src/core/Chapter";
import { FileUrlType } from "@src/core/FileUrl";
import MangaSource from "@src/core/MangaSource";
import { SearchResultType } from "@src/core/SearchResult";
import { DataWithExtra } from "@src/types/utils";
import { load } from "cheerio";

export default class NetTruyen extends MangaSource {
  constructor() {
    super({
      name: "NetTruyen",
      id: "nettruyen",
      languages: ["Vietnamese"],
      isNSFW: false,
      url: "https://nettruyenco.vn",
      logo: "https://nettruyenco.vn/public/assets/images/favicon.png",
    });
  }

  async getMangaId(anilist: any): Promise<DataWithExtra<string>> {
    return {
      data: "hoan-doi-nhiem-mau",
    };
  }

  async loadChapters(
    mangaId: string,
    extraData?: Record<string, string>
  ): Promise<ChapterType[]> {
    return [
      Chapter({
        id: "453",
        number: "453",
        title: "Chapter 453",
        extra: {
          mangaId: mangaId,
        },
      }),
      Chapter({
        id: "452",
        number: "452",
        title: "Chapter 452",
        extra: {
          mangaId: mangaId,
        },
      }),
      Chapter({
        id: "451",
        number: "451",
        title: "Chapter 451",
        extra: {
          mangaId: mangaId,
        },
      }),
      Chapter({
        id: "450",
        number: "450",
        title: "Chapter 450",
        extra: {
          mangaId: mangaId,
        },
      }),
    ];
  }

  async loadImages(
    chapterId: string,
    extraData?: Record<string, string>
  ): Promise<FileUrlType[]> {
    if (!extraData?.mangaId) return [];

    return this.getImages(chapterId, extraData?.mangaId);
  }

  async search(query: string): Promise<SearchResultType[]> {
    return [];
  }

  async getImages(chapterId: string, mangaId: string) {
    try {
      const response = await fetch(
        `https://nettruyenco.vn/truyen-tranh/${mangaId}/chapter-0/${chapterId}`
      );
      const text = await response.text();

      return this.composeImages(text);
    } catch (err) {
      return [];
    }
  }

  composeImages(html: string): FileUrlType[] {
    const $ = load(html);

    const images = $(".page-chapter");

    return images.toArray().map((el) => {
      const imageEl = $(el).find("img");
      const source = (imageEl.data("original") ||
        imageEl.attr("src")) as string;

      const protocols = ["http", "https"];

      const image = protocols.some((protocol) => source.includes(protocol))
        ? source
        : `https:${source}`;

      return {
        url: image,
        headers: {
          referer: "https://nettruyenco.vn",
        },
      };
    });
  }
}
