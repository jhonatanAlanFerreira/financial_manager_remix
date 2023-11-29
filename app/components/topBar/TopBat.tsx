import { Icon } from "~/components/icon/Icon";

export function TopBar({
  updateSidebarOpen,
}: {
  updateSidebarOpen: (value: boolean) => void;
}) {
  return (
    <div className="bg-black w-full h-16 text-white flex items-center pl-4">
      <Icon
        className="cursor-pointer"
        name="Menu"
        onClick={() => updateSidebarOpen(true)}
      ></Icon>
    </div>
  );
}
