export interface ThSortPropsInterface {
  thSortConfigs: {
    title: string;
    sort: boolean;
    className?: string;
    key?: string;
  }[];
  defaultKey?: {
    key: string;
    sortOrder: "asc" | "desc";
  };
  onSortChange?: (key: string, sortOrder: "asc" | "desc") => void;
}
