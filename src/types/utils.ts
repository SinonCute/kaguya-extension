export type DataWithExtra<T> = {
  data: T;
  extraData?: Record<string, string>;
};
