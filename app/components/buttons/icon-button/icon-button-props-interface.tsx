import { ButtonHTMLAttributes } from "react";
import { IconNameType } from "~/shared/shared-types";

export interface IconButtonPropsInterface
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconColor?: string;
  iconName: IconNameType;
}
