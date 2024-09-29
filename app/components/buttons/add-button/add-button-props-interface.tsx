import { ButtonHTMLAttributes } from "react";

export default interface AddButtonPropsInterface
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconColor?: string;
}
