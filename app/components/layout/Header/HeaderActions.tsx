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
    <div className="flex items-center gap-3">
      <HotlineButton />
      <MenuButton open={open} onClick={onToggle} />
    </div>
  );
}