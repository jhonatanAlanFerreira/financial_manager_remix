import { ReactNode } from "react";
import { IconNameType } from "~/shared/shared-types";

export interface AccordionPropsInterface {
  title: string;
  children: ReactNode;
  titleIcons?: {
    iconName: IconNameType;
    iconColor?: string;
    iconTitle?: string;
    onClick?: () => void;
  }[];
}
