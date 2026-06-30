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
      onClick={onClick}
      className="
        flex h-11 w-11 items-center justify-center
        rounded-full
        border
        border-gray-200
        bg-white
        transition-all
        hover:bg-gray-100
      "
    >
      {open ? <X size={22} /> : <Menu size={22} />}
    </button>
  );
}