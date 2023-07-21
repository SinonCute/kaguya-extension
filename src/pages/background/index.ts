import AnimeSource from "@src/core/AnimeSource";
import MangaSource from "@src/core/MangaSource";
import Source, { SourceProps } from "@src/core/Source";
import { anime, manga } from "@src/sources";
import { getDomainFromUrl } from "@src/utils";
import { onMessage, registerListener } from "@src/utils/events";
import { addRules, clearRules } from "@src/utils/rules";
import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
reloadOnUpdate("pages/background");

// /**
//  * Extension reloading is necessary because the browser automatically caches the css.
//  * If you do not use the css of the content script, please delete it.
//  */
// reloadOnUpdate("pages/content/style.scss");

const updateRules = () => {
  const globalRules: Omit<chrome.declarativeNetRequest.Rule, "id">[] = [];

  for (const [_, source] of Object.entries(anime)) {
    for (const rule of source?.rules || []) {
      globalRules.push(rule);
    }
  }

  for (const [_, source] of Object.entries(manga)) {
    for (const rule of source?.rules || []) {
      globalRules.push(rule);
    }
  }

  addRules(globalRules);
};

const composeSources = (sources: typeof anime | typeof manga) => {
  const composedSources: SourceProps[] = [];

  for (const [id, source] of Object.entries(sources)) {
    composedSources.push({
      id,
      isNSFW: source.isNSFW,
      languages: source.languages,
      logo: source.logo,
      name: source.name,
      url: source.url,
    });
  }

  return composedSources;
};

const initializeListeners = () => {
  onMessage("update-rules", async ({ fileUrls }) => {
    const requestHeaders: chrome.declarativeNetRequest.ModifyHeaderInfo[] = [];

    const domains: string[] = [];

    for (const fileUrl of fileUrls) {
      const headers = fileUrl.headers;

      if (!headers) continue;
      if (!Object.keys(headers)) continue;

      const domain = getDomainFromUrl(fileUrl.url);

      if (domain && !domains.includes(domain)) {
        domains.push(domain);
      }

      for (const [header, value] of Object.entries(headers)) {
        if (
          requestHeaders.some(
            (requestHeader) =>
              requestHeader.header === header && requestHeader.value === value
          )
        )
          continue;

        requestHeaders.push({
          header,
          value,
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
        });
      }
    }

    await addRules([
      {
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders,
        },
        condition: {
          requestDomains: domains,
          resourceTypes: [
            chrome.declarativeNetRequest.ResourceType.MEDIA,
            chrome.declarativeNetRequest.ResourceType.IMAGE,
            chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
          ],
        },
      },
    ]);

    return true;
  });

  onMessage("get-anime-sources", () => {
    return composeSources(anime);
  });

  onMessage("get-manga-sources", () => {
    return composeSources(manga);
  });

  onMessage("get-anime-id", async (message) => {
    if (!message) {
      throw new Error("Invalid data");
    }

    const { anilist, sourceId } = message;

    if (!(sourceId in anime)) {
      throw new Error("Invalid sourceId");
    }

    const source: AnimeSource = anime[sourceId];

    return source.getAnimeId(anilist);
  });

  onMessage("get-episodes", (message) => {
    if (!message) {
      throw new Error("Invalid data");
    }

    const { animeId, extraData, sourceId } = message;

    if (!(sourceId in anime)) {
      throw new Error("Invalid sourceId");
    }

    const source: AnimeSource = anime[sourceId];

    return source.loadEpisodes(animeId, extraData);
  });

  onMessage("get-video-servers", (message) => {
    if (!message) {
      throw new Error("Invalid data");
    }

    const { episodeId, sourceId, extraData } = message;

    if (!(sourceId in anime)) {
      throw new Error("Invalid sourceId");
    }

    const source = anime[sourceId];

    return source.loadVideoServers(episodeId, extraData);
  });

  onMessage("get-video-container", (message) => {
    if (!message) {
      throw new Error("Invalid data");
    }

    const { videoServer, extraData, sourceId } = message;

    if (!(sourceId in anime)) {
      throw new Error("Invalid sourceId");
    }

    const source: AnimeSource = anime[sourceId];

    return source.loadVideoContainer(videoServer, extraData);
  });

  onMessage("get-manga-id", async (message) => {
    if (!message) {
      throw new Error("Invalid data");
    }

    const { anilist, sourceId } = message;

    if (!(sourceId in manga)) {
      throw new Error("Invalid sourceId");
    }

    const source: MangaSource = manga[sourceId];

    return source.getMangaId(anilist);
  });

  onMessage("get-chapters", (message) => {
    if (!message) {
      throw new Error("Invalid data");
    }

    const { mangaId, extraData, sourceId } = message;

    if (!(sourceId in manga)) {
      throw new Error("Invalid sourceId");
    }

    const source: MangaSource = manga[sourceId];

    return source.loadChapters(mangaId, extraData);
  });

  onMessage("get-images", (message) => {
    if (!message) {
      throw new Error("Invalid data");
    }

    const { chapterId, sourceId, extraData } = message;

    if (!(sourceId in manga)) {
      throw new Error("Invalid sourceId");
    }

    const source: MangaSource = manga[sourceId];

    return source.loadImages(chapterId, extraData);
  });
};

chrome.runtime.onInstalled.addListener(function () {
  console.log("On installed");

  chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("src/pages/options/index.html"),
      active: true,
    });
  });

  // Listener (communication between web page and chrome extension)
  registerListener();
  initializeListeners();

  (async () => {
    // Rules
    await clearRules();
    await updateRules();
  })();
});
