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

  // return new Promise((resolve) => {
  //   chrome.tabs.query(
  //     {
  //       active: true,
  //       status: "complete",
  //     },
  //     async (tabs) => {
  //       const tab = tabs[0];
  //       const tabId = tab.id;
  //       const result = await chrome.scripting.executeScript({
  //         target: { tabId },
  //         func: (script) => {
  //           return eval(script);
  //         },
  //         args: [script],
  //       });
  //       console.log(result);
  //       resolve(result[0].result);
  //     }
  //   );
  // });
};
