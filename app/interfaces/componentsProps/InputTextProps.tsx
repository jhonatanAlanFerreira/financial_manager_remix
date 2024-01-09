import { InputHTMLAttributes } from "react";
import { IconNameType } from "~/types/IconNameType";

export default interface InputTextProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string;
  icon?: IconNameType;
  onIconClicked?: () => void;
}
