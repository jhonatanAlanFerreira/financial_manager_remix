import { IconNameType } from "~/shared/shared-types";

export type SidebarItemType = {
  title: string;
  icon: IconNameType;
  path: string;
  childrens?: SidebarItemType[];
};
