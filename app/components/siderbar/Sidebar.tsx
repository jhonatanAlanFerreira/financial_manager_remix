import SidebarItem from "~/components/siderbar/SidebarItem";
import { items } from "~/components/siderbar/sidebarData";
import Icon from "~/components/icon/Icon";
import { SidebarItemType } from "~/types/SidebarItemType";

export default function Sidebar({
  sidebarOpen,
  updateSidebarOpen,
}: {
  sidebarOpen: boolean;
  updateSidebarOpen: (value: boolean) => void;
}) {
  return (
    <div
      className={`absolute text-white h-screen overflow-auto bg-violet-950 shadow-xl shadow-black transition-all duration-500 ease-in-out ${
        sidebarOpen ? "opacity-1 w-60" : "opacity-0 w-0"
      }`}
    >
      <div className="text-right">
        <span
          onClick={() => updateSidebarOpen(false)}
          className="inline-block m-1 p-2 cursor-pointer rounded transition duration-500 ease-in-out hover:bg-black hover:bg-opacity-40"
        >
          <Icon name="X" width="1rem"></Icon>
        </span>
      </div>
      {(items as SidebarItemType[]).map((item: SidebarItemType, index) => (
        <div
          key={index}
          className="px-4 py-1 rounded transition duration-500 ease-in-out hover:bg-black hover:bg-opacity-40"
        >
          <SidebarItem key={index} item={item} />
        </div>
      ))}
    </div>
  );
}
