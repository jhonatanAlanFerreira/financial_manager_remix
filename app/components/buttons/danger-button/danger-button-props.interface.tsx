import { ButtonHTMLAttributes } from "react";
import { IconNameType } from "~/shared/icon-name-type";

export interface DangerButtonPropsInterface
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  iconName?: IconNameType;
}
