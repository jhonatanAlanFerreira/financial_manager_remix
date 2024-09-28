import Icon from "~/components/icon/icon";
import { useTitle } from "./title-context";
import TooltipIcon from "~/components/tooltip-icon/tooltip-icon";
import TopBarProps from "./top-bar-props";

export default function TopBar({ updateSidebarOpen }: TopBarProps) {
  const { title } = useTitle();

  return (
    <div className="bg-violet-950 w-full h-16 text-white flex items-center pl-1">
      <span
        onClick={() => updateSidebarOpen(true)}
        className="p-4 cursor-pointer rounded transition-transform duration-500 ease-in-out transform hover:scale-110 hover:bg-black hover:bg-opacity-40"
      >
        <Icon name="Menu" />
      </span>
      <div className="flex justify-center items-center gap-2 w-full">
        {title.pageTitle}
        {title.pageTooltipMessage && (
          <TooltipIcon message={title.pageTooltipMessage}></TooltipIcon>
        )}
      </div>
    </div>
  );
}
