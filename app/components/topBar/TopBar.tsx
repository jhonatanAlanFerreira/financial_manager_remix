import Icon from "~/components/icon/Icon";
import TopBarProps from "~/interfaces/componentsProps/TopBarProps";

export default function TopBar({ updateSidebarOpen }: TopBarProps) {
  return (
    <div className="bg-violet-950 w-full h-16 text-white flex items-center pl-1">
      <span
        onClick={() => updateSidebarOpen(true)}
        className="p-4 cursor-pointer rounded transition-transform duration-500 ease-in-out transform hover:scale-110 hover:bg-black hover:bg-opacity-40"
      >
        <Icon name="Menu" />
      </span>
    </div>
  );
}
