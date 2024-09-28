import { ButtonHTMLAttributes } from "react";
import { IconNameType } from "~/types/IconNameType";

export default interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconColor?: string;
  iconName: IconNameType;
}
