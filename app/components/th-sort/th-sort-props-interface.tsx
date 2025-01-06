export interface ThSortPropsInterface {
  thSortConfigs: {
    title: string;
    sort: boolean;
    className?: string;
    key?: string;
  }[];
  defaultKey?: {
    sort_key: string;
    sort_order: "asc" | "desc";
  };
  onSortChange?: (sort_key: string, sort_order: "asc" | "desc") => void;
}
