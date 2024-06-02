import { HTMLAttributes } from "react";

export default interface FilterTagProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  fieldName: string;
  value: string;
  onClose: (fieldName: string) => void;
}
