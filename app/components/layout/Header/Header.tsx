"use client";

import { useState } from "react";

import Logo from "./logo";
import HeaderActions from "./HeaderActions";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] items-center justify-between px-4">

          <Logo />

          <HeaderActions
            open={open}
            onToggle={() => setOpen(!open)}
          />

        </div>
      </header>

      <MobileMenu
          open={open}
          onClose={() => setOpen(false)}
      />
    </>
  );
}