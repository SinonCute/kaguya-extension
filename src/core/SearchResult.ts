export type SearchResultType = {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  extra?: Record<string, string>;
};

export default function SearchResult(data: SearchResultType) {
  return data;
}
