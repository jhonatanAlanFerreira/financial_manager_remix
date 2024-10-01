import { ButtonHTMLAttributes } from "react";

export interface AddButtonPropsInterface
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconColor?: string;
}
