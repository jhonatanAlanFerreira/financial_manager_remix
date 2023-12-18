import { useState } from "react";
import Icon from "../icon/Icon";
import { Link } from "@remix-run/react";
import SidebarItemProps from "~/interfaces/componentsProps/SidebarItemProps";

export default function SidebarItem({
  item,
  updateSidebarOpen,
}: SidebarItemProps) {
  const [open, setOpen] = useState(false);

  if (item.childrens) {
    return (
      <div className={open ? "open" : ""}>
        <div
          className="flex cursor-pointer justify-between"
          onClick={() => setOpen(!open)}
        >
          <span className="flex gap-2">
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
        className="flex gap-2 rounded transition duration-500 ease-in-out hover:underline"
      >
        {item.icon && <Icon name={item.icon} width="1.2rem"></Icon>}
        {item.title}
      </Link>
    );
  }
}
