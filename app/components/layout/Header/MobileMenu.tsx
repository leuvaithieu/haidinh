import NavItem from "./NavItem";
import { NAV_ITEMS } from "./header.data";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({
  open,
  onClose,
}: MobileMenuProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open
          ? "visible bg-black/60"
          : "invisible bg-black/0"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute right-0 top-0 h-full w-80 bg-zinc-950 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mt-20 flex flex-col gap-2 px-4">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              onClick={onClose}
            />
          ))}
        </div>
      </div>
    </div>
  );
}