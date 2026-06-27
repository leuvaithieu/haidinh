import HotlineButton from "./HotlineButton";
import MenuButton from "./MenuButton";

interface HeaderActionsProps {
  onMenuClick: () => void;
}

export default function HeaderActions({
  onMenuClick,
}: HeaderActionsProps) {
  return (
    <div className="overflow-hidden rounded-full border border-white/10 bg-zinc-900 shadow-lg">
      <div className="flex divide-x divide-white/10">
        <HotlineButton />

        <MenuButton onClick={onMenuClick} />
      </div>
    </div>
  );
}