"use client";

import { Menu, X } from "lucide-react";

interface MenuButtonProps {
  open: boolean;
  onClick: () => void;
}

export default function MenuButton({
  open,
  onClick,
}: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Đóng menu" : "Mở menu"}
      aria-expanded={open}
      aria-controls="mobile-menu"
      className="
        inline-flex h-11 w-11 shrink-0
        items-center justify-center
        rounded-lg border border-gray-200
        bg-white text-gray-800
        transition-colors hover:bg-gray-100
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-red-500
        focus-visible:ring-offset-2
      "
    >
      {open ? (
        <X size={22} aria-hidden="true" />
      ) : (
        <Menu size={22} aria-hidden="true" />
      )}
    </button>
  );
}