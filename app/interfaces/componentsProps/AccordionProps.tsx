import { ReactNode } from "react";
import { IconNameType } from "~/types/IconNameType";

export default interface AccordionProps {
  title: string;
  children: ReactNode;
  titleIcons?: {
    iconName: IconNameType;
    iconColor?: string;
    iconTitle?: string;
    onClick: () => void;
  }[];
}
