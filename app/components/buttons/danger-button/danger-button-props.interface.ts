import { ButtonHTMLAttributes } from "react";
import { IconNameType } from "~/shared/shared-types";

export interface DangerButtonPropsInterface
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  iconName?: IconNameType;
}
