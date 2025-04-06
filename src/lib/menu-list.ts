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
  CreditCard,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  translationKey: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  translationKey: string;
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
          translationKey: "Dashboard.title",
          icon: LayoutDashboard,
          active: pathname === "/dashboard",
        },
        {
          href: "/products",
          label: "Sales",
          translationKey: "Sales.title",
          icon: Package,
          active: pathname === "/products",
          submenus: [
            {
              href: "/products",
              label: "Products",
              translationKey: "Products.title",
              active: pathname === "/products",
            },
            {
              href: "/invoices",
              label: "Invoices",
              translationKey: "Invoices.title",
              active: pathname === "/invoices",
            },
            {
              href: "/quotes",
              label: "Quotes",
              translationKey: "Quotes.title",
              active: pathname === "/quotes",
            },
          ],
        },
        {
          href: "/clients",
          label: "Clients",
          translationKey: "Clients.title",
          icon: Users,
          active: pathname === "/clients",
        },
        {
          href: "/analytics",
          label: "Analytics",
          translationKey: "Analytics.title",
          icon: BarChart,
          active: pathname === "/analytics",
        },
        {
          href: "/billing",
          label: "Billing",
          translationKey: "Billing.title",
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
          translationKey: "Posts.title",
          icon: SquarePen,
          active: pathname.startsWith("/posts"),
          submenus: [
            {
              href: "/posts",
              label: "All Posts",
              translationKey: "Posts.allPosts",
              active: pathname === "/posts",
            },
            {
              href: "/posts/new",
              label: "New Post",
              translationKey: "Posts.newPost",
              active: pathname === "/posts/new",
            },
          ],
        },
        {
          href: "/categories",
          label: "Categories",
          translationKey: "Categories.title",
          icon: Bookmark,
          active: pathname === "/categories",
        },
        {
          href: "/tags",
          label: "Tags",
          translationKey: "Tags.title",
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
          translationKey: "Users.title",
          icon: Users,
          active: pathname === "/users",
        },
        {
          href: "/account",
          label: "Account",
          translationKey: "Account.title",
          icon: Settings,
          active: pathname === "/account",
        },
      ],
    },
  ];
}
