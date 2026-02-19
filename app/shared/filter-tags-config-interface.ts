export interface FilterTagsConfigInterface<T> {
  fieldName: keyof T;
  defaultFieldValue?: any;
  tagLabel: string;
  getTagValue: (fieldValue: any) => string;
}
