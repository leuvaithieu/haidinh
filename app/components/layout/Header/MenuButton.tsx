import { Menu } from "lucide-react";

interface MenuButtonProps {
  onClick: () => void;
}

export default function MenuButton({
  onClick,
}: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center text-white transition-colors hover:bg-zinc-800"
      aria-label="Mở menu"
    >
      <Menu size={20} strokeWidth={2.2} />
    </button>
  );
}