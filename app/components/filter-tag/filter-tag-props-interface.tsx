import { HTMLAttributes } from "react";

export interface FilterTagPropsInterface extends HTMLAttributes<HTMLDivElement> {
  label: string;
  fieldName: string;
  value: string;
  closeBtn: boolean;
  onClose: (fieldName: string) => void;
}
