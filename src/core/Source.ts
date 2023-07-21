import { SearchResultType } from "./SearchResult";

export type SourceProps = {
  name: string;
  url: string;
  id: string;
  isNSFW: boolean;
  languages: string[];
  logo: string;
};

export default class Source implements SourceProps {
  name: string;
  url: string;
  id: string;
  isNSFW: boolean;
  languages: string[];
  logo: string;
  rules?: Omit<chrome.declarativeNetRequest.Rule, "id">[];

  constructor({ id, isNSFW, languages, logo, name, url }: SourceProps) {
    this.id = id;
    this.isNSFW = isNSFW;
    this.languages = languages;
    this.logo = logo;
    this.name = name;
    this.url = url;
  }

  async search(query: string): Promise<SearchResultType[]> {
    throw new Error("Method not implemented.");
  }

  //   updateRules(rules: chrome.declarativeNetRequest.Rule[]) {
  //     this.rules = rules;

  //     this._reupdateRules(rules);
  //   }

  //   private _reupdateRules(rules: chrome.declarativeNetRequest.Rule[]) {
  //     chrome.declarativeNetRequest.getDynamicRules((previousRules) => {
  //       const previousRuleIds = previousRules.map((rule) => rule.id);

  //       chrome.declarativeNetRequest.updateDynamicRules({
  //         removeRuleIds: previousRuleIds,
  //         addRules: [...initialRules, ...rules],
  //       });
  //     });
  //   }
}
