import { HTMLAttributes } from "react";

export default interface FilterTagProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  fieldName: string;
  value: string;
  closeBtn: boolean;
  onClose: (fieldName: string) => void;
}
