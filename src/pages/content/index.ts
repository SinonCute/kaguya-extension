window.addEventListener("request-ext_id", (event) => {
  event.stopImmediatePropagation();

  dispatchEvent(
    new CustomEvent("response-ext_id", { detail: chrome.runtime.id })
  );
});
