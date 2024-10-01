import { SidebarItemType } from "~/components/siderbar/sidebar-item-type";

export interface SidebarItemPropsInterface {
  item: SidebarItemType;
  updateSidebarOpen: (value: boolean) => void;
}
