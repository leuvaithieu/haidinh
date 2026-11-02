"use client";

import { useState } from "react";

import Logo from "./logo";
import DesktopMenu from "./DesktopMenu";
import HeaderActions from "./HeaderActions";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-3 sm:h-[72px] sm:px-5 lg:gap-6 lg:px-8">
          {/* Logo */}
          <div className="min-w-0 shrink-0">
            <Logo />
          </div>

          {/* Menu ngang chỉ dành cho desktop */}
          <DesktopMenu />

          {/* Hotline và nút hamburger trên mobile */}
          <div className="ml-auto shrink-0 lg:ml-0">
            <HeaderActions
              open={open}
              onToggle={handleToggle}
            />
          </div>
        </div>
      </header>

      {/* Menu trượt chỉ dành cho mobile/tablet */}
      <div className="lg:hidden">
        <MobileMenu
          open={open}
          onClose={handleClose}
        />
      </div>
    </>
  );
}