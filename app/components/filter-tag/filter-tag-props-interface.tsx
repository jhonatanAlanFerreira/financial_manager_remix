import { HTMLAttributes } from "react";

export interface FilterTagPropsInterface
  extends HTMLAttributes<HTMLDivElement> {
  tagLabel: string;
  tagValue: string;
  fieldName: string;
  fieldValue: any;
  defaultFieldValue?: any;
  onClose: (fieldName: string, defaultValue?: any) => void;
}
