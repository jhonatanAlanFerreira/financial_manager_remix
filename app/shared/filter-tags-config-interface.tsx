export interface FilterTagsConfigInterface<T> {
  fieldName: keyof T;
  label: string;
  closeBtn: boolean;
  getValue: (fieldValue: any) => string;
}
