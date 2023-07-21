export interface ChapterType {
  number: string;
  id: string;
  title?: string;
  extra?: Record<string, string>;
  section?: string;
}

export default function Chapter(data: ChapterType) {
  return data;
}
