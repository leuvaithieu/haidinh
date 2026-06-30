"use client";

import Link from "next/link";
import { X, House, Bus, MapPinned, BadgeDollarSign, Phone } from "lucide-react";

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
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-40 bg-black/40 transition-opacity duration-300
          ${open ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 right-0 z-50 h-screen w-[85%] max-w-sm
          bg-white shadow-2xl
          transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex h-[72px] items-center justify-end border-b px-4">
          <button onClick={onClose}>
            <X size={26} />
          </button>
        </div>

        <nav className="flex flex-col px-5 py-6">

          <MenuItem icon={<House size={20} />} href="/">
            Trang chủ
          </MenuItem>

          <MenuItem icon={<Bus size={20} />} href="/dat-ve">
            Đặt vé
          </MenuItem>

          <MenuItem icon={<MapPinned size={20} />} href="/lich-trinh">
            Lịch trình
          </MenuItem>

          <MenuItem icon={<BadgeDollarSign size={20} />} href="/gia-ve">
            Giá vé
          </MenuItem>

          <MenuItem icon={<Phone size={20} />} href="/lien-he">
            Liên hệ
          </MenuItem>

        </nav>

        <div className="absolute bottom-8 left-5 right-5">
          <Link
            href="tel:19006079"
            className="flex items-center justify-center rounded-full bg-red-600 py-3 font-semibold text-white"
          >
            Gọi ngay 1900 6079
          </Link>
        </div>
      </aside>
    </>
  );
}

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function MenuItem({
  href,
  icon,
  children,
}: MenuItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-4 text-lg font-medium transition hover:bg-red-50 hover:text-red-600"
    >
      {icon}
      {children}
    </Link>
  );
}