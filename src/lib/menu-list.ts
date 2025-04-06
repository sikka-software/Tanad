import { 
  Tag, 
  Users, 
  Settings, 
  Bookmark, 
  SquarePen, 
  LayoutGrid, 
  LucideIcon,
  LayoutDashboard,
  Package,
  File,
  BarChart,
  CreditCard
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Main",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          active: pathname === "/dashboard",
        },
        {
          href: "/products",
          label: "Sales",
          icon: Package,
          active: pathname === "/products",
          submenus: [
            {
              href: "/products",
              label: "Products",
              active: pathname === "/products",
            },
            {
              href: "/invoices",
              label: "Invoices",
              // icon: File,
              active: pathname === "/invoices",
            },
            {
              href: "/quotes",
              label: "Quotes",
              active: pathname === "/quotes",
            },
          ],
        },
        {
          href: "/clients",
          label: "Clients",
          icon: Users,
          active: pathname === "/clients",
        },
        {
          href: "/analytics",
          label: "Analytics",
          icon: BarChart,
          active: pathname === "/analytics",
        },
        {
          href: "/billing",
          label: "Billing",
          icon: CreditCard,
          active: pathname === "/billing",
        },
      ],
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "",
          label: "Posts",
          icon: SquarePen,
          active: pathname.startsWith("/posts"),
          submenus: [
            {
              href: "/posts",
              label: "All Posts",
              active: pathname === "/posts",
            },
            {
              href: "/posts/new",
              label: "New Post",
              active: pathname === "/posts/new",
            },
          ],
        },
        {
          href: "/categories",
          label: "Categories",
          icon: Bookmark,
          active: pathname === "/categories",
        },
        {
          href: "/tags",
          label: "Tags",
          icon: Tag,
          active: pathname === "/tags",
        },
      ],
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/users",
          label: "Users",
          icon: Users,
          active: pathname === "/users",
        },
        {
          href: "/account",
          label: "Account",
          icon: Settings,
          active: pathname === "/account",
        },
      ],
    },
  ];
}
