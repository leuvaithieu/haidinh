"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./header.data";

export default function DesktopMenu() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="hidden min-w-0 flex-1 items-center justify-center lg:flex"
    >
      <ul className="flex items-center gap-4 xl:gap-6">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative whitespace-nowrap py-2 text-sm font-semibold transition-colors xl:text-base ${
                  isActive
                    ? "text-red-600"
                    : "text-gray-700 hover:text-red-600"
                }`}
              >
                {item.title}

                <span
                  className={`absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-red-600 transition-transform duration-200 ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}