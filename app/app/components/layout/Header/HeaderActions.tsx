import HotlineButton from "./HotlineButton";
import MenuButton from "./MenuButton";

interface HeaderActionsProps {
  open: boolean;
  onToggle: () => void;
}

export default function HeaderActions({
  open,
  onToggle,
}: HeaderActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <HotlineButton />

      {/* Hamburger chỉ hiển thị trên mobile/tablet */}
      <div className="lg:hidden">
        <MenuButton
          open={open}
          onClick={onToggle}
        />
      </div>
    </div>
  );
}