"use client";

import { useState } from "react";

import Logo from "./logo";
import HeaderActions from "./HeaderActions";
import MobileMenu from "./MobileMenu";
import Container from "../Containers";

export default function Header() {
  const [open, setOpen] = useState(false);

  const handleToggleMenu = () => {
    setOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setOpen(false);
  };

  return (
    <>
  <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl shadow-lg">
    <Container className="flex h-[68px] items-center justify-between">
      <Logo />

      <HeaderActions
        open={open}
        onMenuClick={handleToggleMenu}
      />
    </Container>
  </header>

  <MobileMenu
    open={open}
    onClose={handleCloseMenu}
  />
</>
  );
}