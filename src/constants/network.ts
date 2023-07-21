export const corsRules: chrome.declarativeNetRequest.Rule[] = [
  {
    id: 1,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      responseHeaders: [
        {
          header: "Access-Control-Allow-Origin",
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          value: "*",
        },
        {
          header: "Access-Control-Allow-Methods",
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          value: "PUT, GET, HEAD, POST, DELETE, OPTIONS",
        },
        {
          header: "Access-Control-Allow-Headers",
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          value:
            "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
        },
        {
          header: "Access-Control-Allow-Credentials",
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          value: "true",
        },
      ],
    },
    condition: {
      resourceTypes: [
        chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
        chrome.declarativeNetRequest.ResourceType.IMAGE,
        chrome.declarativeNetRequest.ResourceType.MEDIA,
      ],
    },
  },
];
