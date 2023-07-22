export const evalScript = async <T extends unknown>(
  script: string
): Promise<T> => {
  const hasDocument = await chrome.offscreen.hasDocument();

  if (!hasDocument) {
    await chrome.offscreen.createDocument({
      justification: "Eval scripts",
      reasons: [chrome.offscreen.Reason.IFRAME_SCRIPTING],
      url: chrome.runtime.getURL("src/pages/offscreen/index.html"),
    });
  }

  return new Promise(async (resolve) => {
    const listener = (message: any, _: chrome.runtime.MessageSender) => {
      if (message?.target !== "background" || message?.type !== "SANDBOX_EVAL")
        return;

      chrome.runtime.onMessage.removeListener(listener);

      resolve(message?.result);
    };

    chrome.runtime.onMessage.addListener(listener);

    chrome.runtime.sendMessage({
      target: "offscreen",
      data: script,
      type: "SANDBOX_EVAL",
    });
  });
};
