import Link from "next/link";
import { Phone } from "lucide-react";

export default function HotlineButton() {
  return (
    <Link
      href="tel:19001234"
      className="flex h-11 w-11 items-center justify-center bg-red-600 text-white transition-colors hover:bg-red-700"
      aria-label="Gọi hotline"
    >
      <Phone size={18} strokeWidth={2.2} />
    </Link>
  );
}