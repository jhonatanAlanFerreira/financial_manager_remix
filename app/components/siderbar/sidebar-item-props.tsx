import { SidebarItemType } from "~/types/SidebarItemType";

export default interface SidebarItemProps {
  item: SidebarItemType;
  updateSidebarOpen: (value: boolean) => void;
}
