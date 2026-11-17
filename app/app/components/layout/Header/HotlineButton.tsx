import Link from "next/link";
import { Phone } from "lucide-react";
import { HOTLINE } from "./header.data";

export default function HotlineButton() {
  const phoneHref = HOTLINE.replace(/[^\d+]/g, "");

  return (
    <Link
      href={`tel:${phoneHref}`}
      aria-label={`Gọi hotline ${HOTLINE}`}
      className="
        inline-flex min-h-11 shrink-0 items-center justify-center gap-2
        rounded-full bg-red-600 px-3
        text-sm font-semibold text-white
        transition-colors duration-200
        hover:bg-red-700
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-red-500
        focus-visible:ring-offset-2
        sm:px-4
      "
    >
      <Phone size={17} aria-hidden="true" />

      <span className="whitespace-nowrap">
        <span className="sm:hidden">Hotline</span>
        <span className="hidden sm:inline">{HOTLINE}</span>
      </span>
    </Link>
  );
}