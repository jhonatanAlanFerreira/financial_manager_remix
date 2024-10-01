import { InputHTMLAttributes } from "react";
import { IconNameType } from "~/shared/icon-name-type";

export interface InputTextPropsInterface
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string;
  icon?: IconNameType;
  onIconClicked?: () => void;
}
