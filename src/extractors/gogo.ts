import { load } from "cheerio";
import CryptoJS from "crypto-js";

// Thanks https://github.com/riimuru for gogoanime's extraction code :)
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36";
export const BASE_URL = "https://gogoanimehd.to";
export const GOLOAD_STREAM_URL = "https://playtaku.online/streaming.php";

const keys = {
  key: CryptoJS.enc.Utf8.parse("37911490979715163134003223491201"),
  second_key: CryptoJS.enc.Utf8.parse("54674138327930866480207815084989"),
  iv: CryptoJS.enc.Utf8.parse("3134003223491201"),
};

function decryptEncryptAjaxResponse(obj: { data: string }) {
  const decrypted = CryptoJS.enc.Utf8.stringify(
    CryptoJS.AES.decrypt(obj.data, keys.second_key, {
      iv: keys.iv,
    })
  );

  return JSON.parse(decrypted);
}

async function generateEncryptAjaxParameters($, id) {
  // encrypt the key
  const encrypted_key = CryptoJS.AES["encrypt"](id, keys.key, {
    iv: keys.iv,
  });

  const script = $("script[data-name='episode']").data().value;
  const token = CryptoJS.AES["decrypt"](script, keys.key, {
    iv: keys.iv,
  }).toString(CryptoJS.enc.Utf8);

  return "id=" + encrypted_key + "&alias=" + id + "&" + token;
}

type Source = {
  file: string;
  label: string;
  type: string;
};

const gogoExtractor = async (id: string) => {
  const sources = [];
  const sources_bk = [];
  try {
    let server, $, serverUrl;

    if (id.includes("episode")) {
      const epPageResponse = await fetch(BASE_URL + "/" + id);
      const epPage = await epPageResponse.text();

      $ = load(epPage);

      server = $("#load_anime > div > div > iframe").attr("src");

      serverUrl = new URL(server);
    } else serverUrl = new URL(`${GOLOAD_STREAM_URL}?id=${id}`);

    const goGoServerPageResponse = await fetch(serverUrl.href, {
      headers: { "User-Agent": USER_AGENT },
    });
    const goGoServerPage = await goGoServerPageResponse.text();

    const $$ = load(goGoServerPage);

    const params = await generateEncryptAjaxParameters(
      $$,
      serverUrl.searchParams.get("id")
    );

    const fetchResponse = await fetch(
      `
      ${serverUrl.protocol}//${serverUrl.hostname}/encrypt-ajax.php?${params}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    const fetchRes = await fetchResponse.json();

    const res = decryptEncryptAjaxResponse(fetchRes);

    if (!res.source) return { error: "No source found" };

    res.source.forEach((source) => sources.push(source));
    res.source_bk.forEach((source) => sources_bk.push(source));

    return {
      Referer: serverUrl.href as string,
      sources: sources as Source[],
      sources_bk: sources_bk as Source[],
    };
  } catch (err) {
    return { error: err };
  }
};

export default gogoExtractor;
