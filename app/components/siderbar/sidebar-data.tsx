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
    title: "Income Categories",
    icon: "TrendingUp",
    path: "/incomes",
  },
  {
    title: "Expenses Categories",
    icon: "DollarSign",
    path: "/expenses",
  },
  {
    title: "Inco./Expe. Classifications",
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
