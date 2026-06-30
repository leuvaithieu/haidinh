import Link from "next/link";
import { Phone } from "lucide-react";

export default function HotlineButton() {
  return (
    <Link
      href="tel:0982561204"
      className="
        flex items-center gap-2
        rounded-full
        bg-yellow-400
        px-4 py-2
        text-sm
        font-semibold
        text-black
        transition-all
        duration-200
        hover:scale-105
        hover:bg-yellow-300
      "
    >
      <Phone size={16} />
      <span>0982561204</span>
    </Link>
  );
}