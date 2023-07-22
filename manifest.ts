import packageJson from "./package.json";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  icons: {
    "128": "icon-128.png",
  },
  action: {},
  content_scripts: [
    {
      matches: [
        "https://kaguya.app/*",
        "http://localhost/*",
        "https://*.kaguya.app/*",
      ],
      js: ["src/pages/content/index.js"],
      run_at: "document_start",
    },
  ],
  externally_connectable: {
    matches: [
      "https://kaguya.app/*",
      "https://*.kaguya.app/*",
      "http://localhost/*",
    ],
  },
  devtools_page: "src/pages/devtools/index.html",
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "icon-128.png",
        "icon-34.png",
        "src/pages/sandbox/index.html",
      ],
      matches: ["*://*/*"],
    },
  ],
  permissions: [
    "declarativeNetRequestFeedback",
    "declarativeNetRequest",
    "scripting",
    "offscreen",
  ],
  host_permissions: ["*://*/*"],
  content_security_policy: {
    extension_pages:
      "default-src 'self'; connect-src https://* ws://* data: blob: filesystem:;",
  },
  sandbox: {
    pages: ["src/pages/sandbox/index.html"],
  },
};

export default manifest;
