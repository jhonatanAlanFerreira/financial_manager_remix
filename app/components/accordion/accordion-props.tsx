import { ReactNode } from "react";
import { IconNameType } from "~/shared/icon-name-type";

export default interface AccordionProps {
  title: string;
  children: ReactNode;
  titleIcons?: {
    iconName: IconNameType;
    iconColor?: string;
    iconTitle?: string;
    onClick?: () => void;
  }[];
}
