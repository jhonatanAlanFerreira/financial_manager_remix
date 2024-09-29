import { SidebarItemType } from "./sidebar-item-type";

export default interface SidebarItemPropsInterface {
  item: SidebarItemType;
  updateSidebarOpen: (value: boolean) => void;
}
