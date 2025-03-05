import { useState } from "react";
import { Icon } from "~/components/icon/icon";
import { Link } from "@remix-run/react";
import { SidebarItemPropsInterface } from "~/components/siderbar/sidebar-item-props-interface";

export function SidebarItem({
  item,
  updateSidebarOpen,
  ...rest
}: SidebarItemPropsInterface) {
  const [open, setOpen] = useState<boolean>(false);

  if (item.childrens) {
    return (
      <div className={`${open ? "open" : ""} ${rest.className} mb-1`}>
        <div
          className="flex cursor-pointer justify-between"
          onClick={() => setOpen(!open)}
        >
          <span className="flex gap-2 items-center">
            {item.icon && <Icon name={item.icon} width="1.2rem"></Icon>}
            {item.title}
          </span>
          <span
            className={`cursor-pointer transition duration-500 ease-in-out ${
              open ? "rotate-180" : ""
            }`}
          >
            <Icon name="ArrowDown" width="1rem"></Icon>
          </span>
        </div>
        <div className={open ? "height-auto" : "h-0 overflow-hidden"}>
          {item.childrens.map((child, index) => (
            <div
              className="px-3 py-1 rounded transition duration-500 ease-in-out hover:bg-black hover:bg-opacity-40"
              key={index}
            >
              <SidebarItem
                updateSidebarOpen={updateSidebarOpen}
                key={index}
                item={child}
              />
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <Link
        onClick={() => updateSidebarOpen(false)}
        to={item.path}
        className={`flex gap-2 rounded transition duration-500 ease-in-out hover:underline mb-1 ${rest.className}`}
      >
        <span className="flex gap-2 items-center">
          {item.icon && <Icon name={item.icon} width="1.2rem"></Icon>}
          {item.title}
        </span>
      </Link>
    );
  }
}
