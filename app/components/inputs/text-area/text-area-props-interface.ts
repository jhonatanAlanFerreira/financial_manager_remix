import { InputHTMLAttributes } from "react";

export interface TextAreaPropsInterface
  extends InputHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  errorMessage?: string;
}
