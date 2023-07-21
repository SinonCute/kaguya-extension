window.addEventListener("bridge-request", (event: CustomEvent) => {
  event.stopImmediatePropagation();

  const detail = event.detail as any;

  if (!detail?.endpoint || detail?.type !== "REQUEST") {
    throw new Error("[content-script] Invalid detail");
  }

  chrome.runtime.sendMessage(detail, (response) => {
    console.log("content script ", detail?.endpoint, response);

    dispatchEvent(
      new CustomEvent("bridge-response", {
        detail: {
          endpoint: detail.endpoint,
          data: response,
          type: "RESPONSE",
        },
      })
    );
  });
});
