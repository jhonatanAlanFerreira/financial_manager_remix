import { SidebarItemType } from "~/types/SidebarItemType";

export const items: SidebarItemType[] = [
  {
    title: "Home",
    icon: "Home",
    path: "/",
  },
  {
    title: "Expenses",
    icon: "DollarSign",
    path: "/expenses",
  },
  {
    title: "Settings",
    icon: "Settings",
    path: "",
    childrens: [
      {
        title: "Logout",
        icon: "LogOut",
        path: "/api/logout",
      },
    ],
  },
];
