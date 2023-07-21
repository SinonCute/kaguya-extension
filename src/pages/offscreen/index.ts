const iframe = document.querySelector("#iframe") as HTMLIFrameElement;

chrome.runtime.onMessage.addListener((evalScript) => {
  if (
    evalScript?.target === "offscreen" &&
    evalScript?.type === "SANDBOX_EVAL"
  ) {
    iframe.contentWindow.postMessage(evalScript.data, "*");

    window.addEventListener(
      "message",
      (event) => {
        chrome.runtime.sendMessage({
          target: "background",
          result: event.data,
          type: "SANDBOX_EVAL",
        });
      },
      false
    );

    return true;
  }
});
