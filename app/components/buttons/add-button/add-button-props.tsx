import { ButtonHTMLAttributes } from "react";

export default interface AddButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconColor?: string;
}
