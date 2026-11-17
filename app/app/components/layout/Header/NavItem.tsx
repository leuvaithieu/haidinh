import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  title: string;
  href: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export default function NavItem({
  title,
  href,
  icon: Icon,
  onClick,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-white transition hover:bg-red-600/20 hover:text-red-500"
    >
      <Icon size={20} />

      <span>{title}</span>
    </Link>
  );
}