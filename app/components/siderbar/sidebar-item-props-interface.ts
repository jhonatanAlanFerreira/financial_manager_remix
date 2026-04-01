import { SidebarItemType } from "~/components/siderbar/sidebar-item-type";

export interface SidebarItemPropsInterface
  extends React.HTMLAttributes<HTMLDivElement> {
  item: SidebarItemType;
  updateSidebarOpen: (value: boolean) => void;
}
