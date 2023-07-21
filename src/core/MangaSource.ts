import { DataWithExtra } from "@src/types/utils";
import { ChapterType } from "./Chapter";
import { FileUrlType } from "./FileUrl";
import Source from "./Source";

export default class MangaSource extends Source {
  //TODO: Add anilist media type
  /**
   * Retrieves the manga id based on the provided Anilist data.
   *
   * This function is responsible for returning the appropriate manga id, which will then be passed as a parameter to the `loadEpisodes` function.
   *
   * The manga id can be obtained by using the source's search function or by using any existing mapping.
   *
   */
  async getMangaId(anilist: any): Promise<DataWithExtra<string>> {
    throw new Error("Method not implemented.");
  }

  async loadChapters(
    mangaId: string,
    extraData?: Record<string, string>
  ): Promise<ChapterType[]> {
    throw new Error("Method not implemented.");
  }

  async loadImages(
    chapterId: string,
    extraData?: Record<string, string>
  ): Promise<FileUrlType[]> {
    throw new Error("Method not implemented.");
  }
}
