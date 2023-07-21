import { FileUrlType } from "./FileUrl";

enum Format {
  VTT = "vtt",
  ASS = "ass",
  SRT = "srt",
}

export interface SubtitleType {
  language: String;
  file: FileUrlType;
  type: Format;
}

export default function Subtitle(data: SubtitleType) {
  return data;
}
