import packageJson from "./package.json";

const name = "Kaguya";
const description = "An extension that allow you to use Kaguya";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name,
  version: packageJson.version,
  description,
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  icons: {
    "16": "icon16.png",
    "32": "icon32.png",
    "48": "icon48.png",
    "128": "icon128.png",
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
        "icon16.png",
        "icon32.png",
        "icon48.png",
        "icon128.png",
        "src/pages/sandbox/index.html",
      ],
      matches: ["*://*/*"],
    },
  ],
  permissions: ["declarativeNetRequest", "offscreen"],
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
