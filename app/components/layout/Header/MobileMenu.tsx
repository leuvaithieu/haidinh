"use client";

import Link from "next/link";
import { X, Phone } from "lucide-react";
import { NAV_ITEMS } from "./header.data";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({
  open,
  onClose,
}: MobileMenuProps) {
  return (
    <>
      {/* Lớp nền */}
      <button
        type="button"
        aria-label="Đóng menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          open
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      />

      {/* Menu trượt */}
      <aside
        id="mobile-menu"
        aria-label="Menu điều hướng"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Đầu menu */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-100 px-5">
          <div>
            <p className="text-xl font-black tracking-wide text-red-600">
              HẢI ĐỊNH
            </p>

            <p className="mt-1 text-[11px] text-neutral-500">
              Chất lượng tạo niềm tin
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        {/* Các mục menu lấy từ dữ liệu dùng chung */}
        <nav
          aria-label="Điều hướng trên điện thoại"
          className="flex-1 overflow-y-auto px-4 py-5"
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    tabIndex={open ? 0 : -1}
                    className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-neutral-700 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <Icon
                      size={21}
                      className="shrink-0"
                      aria-hidden="true"
                    />

                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Hotline */}
        <div className="shrink-0 border-t border-gray-100 p-5">
          <a
            href="tel:19006079"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <Phone size={18} aria-hidden="true" />
            Gọi ngay 1900 6079
          </a>
        </div>
      </aside>
    </>
  );
}