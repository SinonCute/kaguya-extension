// import AnimeT from "./anime/animet";
import Gogo from "./anime/gogo";

import MangaDex from "./manga/mangadex";
// import NetTruyen from "./manga/nettruyen";

export const anime = {
  // animet: new AnimeT(),
  gogo: new Gogo(),
} as const;

export const manga = {
  mangadex: new MangaDex(),
  // nettruyen: new NetTruyen(),
} as const;
