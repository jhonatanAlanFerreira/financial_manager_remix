import { ButtonHTMLAttributes } from "react";
import { IconNameType } from "~/shared/icon-name-type";

export default interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconColor?: string;
  iconName: IconNameType;
}
