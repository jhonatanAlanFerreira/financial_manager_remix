import { InputHTMLAttributes } from "react";

export default interface InputTextProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string;
}
