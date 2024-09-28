import { IconNameType } from "~/shared/icon-name-type";

export type SidebarItemType = {
  title: string;
  icon: IconNameType;
  path: string;
  childrens?: SidebarItemType[];
};
