import SidebarItem from "~/components/siderbar/SidebarItem";
import { items } from "~/components/siderbar/sidebarData";
import { Icon } from "~/components/icon/Icon";
import { SidebarItemType } from "~/types/SidebarItemType";

export default function Sidebar() {
  return (
    <div className="text-white h-screen overflow-auto bg-black w-60">
      <div className="text-right cursor-pointer">
        <span className="inline-block">
          <Icon className="mr-1" name="ArrowLeft" width="1rem"></Icon>
        </span>
      </div>
      {(items as SidebarItemType[]).map((item: SidebarItemType, index) => (
        <div key={index} className="px-4 py-1 rounded transition duration-500 ease-in-out hover:bg-gray-800 hover:bg-opacity-90">
          <SidebarItem key={index} item={item} />
        </div>
      ))}
    </div>
  );
}
