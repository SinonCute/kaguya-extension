import { FileUrlType } from "./FileUrl";

export enum VideoFormat {
  M3U8 = "m3u8",
  DASH = "dash",
  CONTAINER = "container",
}

export interface VideoType {
  quality?: string;
  format: VideoFormat;
  file: FileUrlType;
}

export default function Video(data: VideoType) {
  return data;
}
