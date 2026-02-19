import { InputHTMLAttributes } from "react";
import { IconNameType } from "~/shared/shared-types";

export interface InputTextPropsInterface
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string;
  icon?: IconNameType;
  onIconClicked?: () => void;
}
