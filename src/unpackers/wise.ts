// @ts-nocheck

import { evalScript } from "@src/utils/eval";

// https://github.com/Alluseri/NotSoWise/blob/main/unpacker.js

// eslint-disable-next-line no-unused-vars
export async function Wise_EvalDecode(source) {
  if (!isPacked(source)) throw "Not matched";

  let code = source;
  if (code.startsWith("//Protected by WiseLoop PHP JavaScript Obfuscator"))
    code = code.substring(code.indexOf("\n")).trim();

  code = await evalScript(code.replace(";eval", ""));

  code = await evalScript(code.replace(";eval", ""));

  if (code.includes("; ;eval")) {
    code = await evalScript(
      "(" +
        code
          .substring(code.indexOf("; ;eval") + "; ;eval".length)
          .replace(");}('", ");})('")
    );
  }

  if (hasDomainCheck(code)) {
    code = code.substring(
      code.indexOf(");}throw new Error('');}") +
        ");}throw new Error('');}".length
    );
  }

  return code;
}

export async function Wise_FunctionalDecode(source) {
  if (!isPacked(source)) throw "Not matched";
  let code = source;
  if (code.startsWith("//Protected by WiseLoop PHP JavaScript Obfuscator"))
    code = code.substring(code.indexOf("\n")).trim();

  code = await unpackStep(await unpackStep(await unpackStep(code)));

  if (hasDomainCheck(code)) {
    code = code.substring(
      code.indexOf(");}throw new Error('');}") +
        ");}throw new Error('');}".length
    );
  }
  return code;
}

// Sorry for not translating this one!
function unpackAlgorithm(w, i, s, e) {
  let lIll = 0;
  let ll1I = 0;
  let Il1l = 0;
  const ll1l = [];
  const l1lI = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (lIll < 5) l1lI.push(w.charAt(lIll));
    else if (lIll < w.length) ll1l.push(w.charAt(lIll));
    lIll++;
    if (ll1I < 5) l1lI.push(i.charAt(ll1I));
    else if (ll1I < i.length) ll1l.push(i.charAt(ll1I));
    ll1I++;
    if (Il1l < 5) l1lI.push(s.charAt(Il1l));
    else if (Il1l < s.length) ll1l.push(s.charAt(Il1l));
    Il1l++;
    if (
      w.length + i.length + s.length + e.length ==
      ll1l.length + l1lI.length + e.length
    ) {
      break;
    }
  }
  const lI1l = ll1l.join("");
  const I1lI = l1lI.join("");
  ll1I = 0;
  const l1ll = [];
  for (lIll = 0; lIll < ll1l.length; lIll += 2) {
    let ll11 = -1;
    if (I1lI.charCodeAt(ll1I) % 2) ll11 = 1;
    l1ll.push(String.fromCharCode(parseInt(lI1l.substr(lIll, 2), 36) - ll11));
    ll1I++;
    if (ll1I >= l1lI.length) ll1I = 0;
  }
  return l1ll.join("");
}
async function unpackStep(code) {
  const argsScope = code.split(");}(")[1];
  const args = await evalScript(
    "[" + argsScope.substring(0, argsScope.length - 3) + "]"
  );
  return unpackAlgorithm(args[0], args[1], args[2], args[3]);
}
function isPacked(src) {
  return (
    src.startsWith("//Protected by WiseLoop PHP JavaScript Obfuscator") ||
    src.includes(";eval(function(w,i,s,e)")
  );
}
function hasDomainCheck(src) {
  return (
    src.includes('window.location.hostname.replace("www.","")') &&
    src.includes("throw new Error('');")
  );
}

// Warning: The code expects the source to be well-formed. Perhaps I will implement additional checks later.
