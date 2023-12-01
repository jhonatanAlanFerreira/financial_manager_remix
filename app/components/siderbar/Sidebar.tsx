import SidebarItem from "~/components/siderbar/SidebarItem";
import { items } from "~/components/siderbar/sidebarData";
import { Icon } from "~/components/icon/Icon";
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
      className={`absolute text-white h-screen overflow-auto bg-black transition-all duration-500 ease-in-out ${
        sidebarOpen ? "opacity-1 w-60" : "opacity-0 w-0"
      }`}
    >
      <div className="text-right cursor-pointer">
        <span className="inline-block">
          <Icon
            className="mr-1"
            name="ArrowLeft"
            width="1rem"
            onClick={() => updateSidebarOpen(false)}
          ></Icon>
        </span>
      </div>
      {(items as SidebarItemType[]).map((item: SidebarItemType, index) => (
        <div
          key={index}
          className="px-4 py-1 rounded transition duration-500 ease-in-out hover:bg-gray-800 hover:bg-opacity-90"
        >
          <SidebarItem key={index} item={item} />
        </div>
      ))}
    </div>
  );
}
