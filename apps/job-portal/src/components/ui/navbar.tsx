"use client";

import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";

const Navbar = () => {
  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            Job Portal
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link
              href="/jobs"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Jobs
            </Link>
            <Link
              href="/companies"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Companies
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Link
            href="/post-job"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Post a Job
          </Link>
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
