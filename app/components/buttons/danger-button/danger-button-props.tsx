import { ButtonHTMLAttributes } from "react";
import { IconNameType } from "~/types/IconNameType";

export default interface DangerButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  iconName?: IconNameType;
}
