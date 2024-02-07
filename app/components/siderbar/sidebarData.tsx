import { SidebarItemType } from "~/types/SidebarItemType";

export const items: SidebarItemType[] = [
  {
    title: "Home",
    icon: "Home",
    path: "/",
  },
  {
    title: "Transactions",
    icon: "Repeat",
    path: "/transactions",
  },
  {
    title: "Companies",
    icon: "Briefcase",
    path: "/companies",
  },
  {
    title: "Expenses",
    icon: "DollarSign",
    path: "/expenses",
  },
  {
    title: "Classifications",
    icon: "List",
    path: "/classifications",
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
