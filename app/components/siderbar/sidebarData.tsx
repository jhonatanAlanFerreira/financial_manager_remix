import { SidebarItemType } from "~/types/SidebarItemType";

export const items: SidebarItemType[] = [
  {
    title: "Dashboard",
    icon: "PieChart",
    path: "/",
  },
  {
    title: "Transactions",
    icon: "Repeat",
    path: "/transactions",
  },
  {
    title: "Companies and Accounts",
    icon: "Briefcase",
    path: "/companies-accounts",
  },
  {
    title: "Incomes",
    icon: "TrendingUp",
    path: "/incomes",
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
