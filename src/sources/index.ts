// import AnimeT from "./anime/animet";
import AnimeVietSub from "./anime/animevietsub";
import Gogo from "./anime/gogo";

import MangaDex from "./manga/mangadex";
// import NetTruyen from "./manga/nettruyen";

export const anime = {
  // animet: new AnimeT(),
  gogo: new Gogo(),
  avs: new AnimeVietSub(),
} as const;

export const manga = {
  mangadex: new MangaDex(),
  // nettruyen: new NetTruyen(),
} as const;
