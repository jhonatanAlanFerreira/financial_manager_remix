import { IconNameType } from "~/types/IconNameType";

export type SidebarItemType = {
  title: string;
  icon: IconNameType;
  path: string;
  childrens?: SidebarItemType[];
};
