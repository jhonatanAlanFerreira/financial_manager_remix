import { ButtonHTMLAttributes } from "react";
import { IconNameType } from "~/shared/icon-name-type";

export default interface DangerButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  iconName?: IconNameType;
}
