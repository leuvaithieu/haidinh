import Link from "next/link";
import { Phone } from "lucide-react";

export default function Hotline() {
  return (
    <Link
      href="tel:0982 561 204"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700"
      aria-label="Hotline"
    >
      <Phone size={18} />
    </Link>
  );
}