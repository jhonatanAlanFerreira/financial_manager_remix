import { SidebarItemType } from "./sidebar-item-type";

export default interface SidebarItemProps {
  item: SidebarItemType;
  updateSidebarOpen: (value: boolean) => void;
}
