import { SidebarItemType } from "~/components/siderbar/sidebar-item-type";

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
    className: "menu-classificatio-step",
    icon: "List",
    path: "/classifications",
  },
  {
    title: "Merchants",
    icon: "ShoppingCart",
    path: "/merchants",
  },
  {
    title: "Docs",
    icon: "FileText",
    path: "",
    childrens: [
      {
        title: "API",
        icon: "FileText",
        path: "/docs",
      },
      {
        title: "GraphQL",
        icon: "FileText",
        path: "/graphql-playground",
      },
    ],
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
