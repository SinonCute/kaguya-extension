import { compareNestedObjects, removeDuplicates } from ".";

export const addRules = (
  newRules: Omit<chrome.declarativeNetRequest.Rule, "id">[],
  options?: chrome.declarativeNetRequest.UpdateRuleOptions
) => {
  return new Promise((resolve) => {
    chrome.declarativeNetRequest.getDynamicRules(async (existRules) => {
      const ruleIds = existRules.map((rule) => rule.id);
      const maxRuleId = Math.max(...ruleIds);

      let currentRuleId = ruleIds?.length ? maxRuleId : 0;

      // Combine newRules and existRules
      const allRules = [...newRules, ...existRules];

      // Remove duplicates by converting to Set and back to array
      const uniqueRules = removeDuplicates(allRules, (a, b) => {
        // Check condition
        if (!compareNestedObjects(a.condition, b.condition)) return false;

        // Check action
        return compareNestedObjects(a.action, b.action);
      });

      const newRulesWithId: chrome.declarativeNetRequest.Rule[] =
        uniqueRules.map((rule) => ({ ...rule, id: ++currentRuleId }));

      console.log("adding new rules", newRulesWithId);

      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: newRulesWithId,
        ...options,
      });

      console.log("added rules");

      resolve(null);
    });
  });
};

export const clearRules = () => {
  return new Promise((resolve) => {
    chrome.declarativeNetRequest.getDynamicRules(async (existRules) => {
      const ruleIds = existRules.map((rule) => rule.id);

      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
      });

      resolve(null);
    });
  });
};
