export const parseBetween = (str: string, start: string, end: string) => {
  let strArr = [];

  strArr = str.split(start);
  strArr = strArr[1].split(end);

  return strArr[0];
};

export const isValidUrl = (text: string) => {
  let url: URL;

  try {
    url = new URL(text);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

export function serialize(obj: { [key: string]: any }): string {
  const queryParams: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (Array.isArray(value)) {
        value.forEach((element) => {
          queryParams.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(element)}`
          );
        });
      } else {
        queryParams.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        );
      }
    }
  }

  return queryParams.join("&");
}

export function getDomainFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    // Invalid URL format
    console.error("Error parsing URL:", error);
    return null;
  }
}

// https://stackoverflow.com/questions/5457416/how-to-validate-numeric-values-which-may-contain-dots-or-commas
export const parseNumbersFromString = (
  text: string,
  fallbackNumber = null
): number[] => {
  const matches = text.match(/\d+([\.,][\d{1,2}])?/g);

  if (!matches) return [fallbackNumber];

  return matches.map(Number);
};

export const parseNumberFromString = (text: string, fallbackNumber = null) => {
  return parseNumbersFromString(text, fallbackNumber)[0];
};

type ComparisonFunction<T> = (a: T, b: T) => boolean;

export function removeDuplicates<T>(
  arr: T[],
  shouldRemove: ComparisonFunction<T>
): T[] {
  const uniqueArr: T[] = [];

  for (const item of arr) {
    const isDuplicate = uniqueArr.some((existingItem) =>
      shouldRemove(existingItem, item)
    );
    if (!isDuplicate) {
      uniqueArr.push(item);
    }
  }

  return uniqueArr;
}

export function compareNestedObjects(obj1: any, obj2: any): boolean {
  // Check if both objects are of type object
  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return obj1 === obj2;
  }

  // Get the keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if the number of keys is the same
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Iterate over the keys
  for (const key of keys1) {
    // Get the values for the current key
    const val1 = obj1[key];
    const val2 = obj2[key];

    // Recursively compare nested objects
    if (!compareNestedObjects(val1, val2)) {
      return false;
    }
  }

  // All keys and values match
  return true;
}
