import { ChapterType } from "@src/core/Chapter";
import { EpisodeType } from "@src/core/Episode";
import { FileUrlType } from "@src/core/FileUrl";
import { VideoContainerType } from "@src/core/VideoContainer";
import { VideoServerType } from "@src/core/VideoServer";
import { anime, manga } from "@src/sources";
import { EventType } from "@src/types/events";
import { DataWithExtra } from "@src/types/utils";

type AnimeSourceId = keyof typeof anime;
type MangaSourceId = keyof typeof manga;

type ListenerWithReturn<Data, ReturnData> = (
  data: Data
) => Promise<ReturnData> | ReturnData;

type DefaultListener = ListenerWithReturn<unknown, unknown>;

type UnsubscribeListen = () => void;

export type ListenersMap = {
  "update-rules": ListenerWithReturn<
    { fileUrls: FileUrlType[]; sourceId: string },
    any
  >;

  "get-episodes": ListenerWithReturn<
    {
      animeId: string;
      extraData?: Record<string, string>;
      sourceId: AnimeSourceId;
    },
    EpisodeType[]
  >;

  "get-chapters": ListenerWithReturn<
    {
      mangaId: string;
      extraData?: Record<string, string>;
      sourceId: MangaSourceId;
    },
    ChapterType[]
  >;

  "get-anime-id": ListenerWithReturn<
    {
      anilist: any;
      sourceId: AnimeSourceId;
    },
    DataWithExtra<string>
  >;

  "get-manga-id": ListenerWithReturn<
    {
      anilist: any;
      sourceId: MangaSourceId;
    },
    DataWithExtra<string>
  >;

  "get-images": ListenerWithReturn<
    {
      chapterId: string;
      extraData?: Record<string, string>;
      sourceId: MangaSourceId;
    },
    FileUrlType[]
  >;

  "get-video-servers": ListenerWithReturn<
    {
      episodeId: string;
      extraData?: Record<string, string>;
      sourceId: AnimeSourceId;
    },
    VideoServerType[]
  >;

  "get-video-container": ListenerWithReturn<
    {
      videoServer: VideoServerType;
      extraData?: Record<string, string>;
      sourceId: AnimeSourceId;
    },
    VideoContainerType
  >;
};

const listeners: Record<string, (data: any) => any> = {};

export function onMessage<Endpoint extends keyof ListenersMap>(
  endpoint: Endpoint,
  callback: ListenersMap[Endpoint]
): UnsubscribeListen;
export function onMessage(
  endpoint: string,
  callback: DefaultListener
): UnsubscribeListen;
export function onMessage(
  endpoint: string,
  callback: DefaultListener
): UnsubscribeListen {
  listeners[endpoint] = callback;

  return () => {
    delete listeners[endpoint];
  };
}

export const registerListener = async () => {
  chrome.runtime.onMessage.addListener((event, sender, sendResponse) => {
    (async () => {
      if (!event?.endpoint || event?.type !== EventType.Request) {
        return;
      }

      if (!(event.endpoint in listeners)) {
        return;
      }

      const listener = listeners[event.endpoint];

      const data = await listener(event.data);

      console.log("data from listener", data);

      sendResponse(data);
    })();

    return true;
  });
};
