import { Icon } from "~/components/icon/icon";
import { SidebarPropsInterface } from "~/components/siderbar/sidebar-props-interface";
import { SidebarItemType } from "~/components/siderbar/sidebar-item-type";
import { SidebarItem } from "~/components/siderbar/sidebar-item";
import { items } from "~/components/siderbar/sidebar-data";

export function Sidebar({
  sidebarOpen,
  updateSidebarOpen,
}: SidebarPropsInterface) {
  return (
    <div
      className={`absolute z-10 text-white h-screen overflow-auto bg-violet-950 shadow-xl shadow-black transition-all duration-500 ease-in-out whitespace-nowrap ${
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
          <SidebarItem
            updateSidebarOpen={updateSidebarOpen}
            key={index}
            item={item}
            className={item.className}
          />
        </div>
      ))}
    </div>
  );
}
