import Icon from "~/components/icon/Icon";

export default function TopBar({
  updateSidebarOpen,
}: {
  updateSidebarOpen: (value: boolean) => void;
}) {
  return (
    <div className="bg-violet-950 w-full h-16 text-white flex items-center pl-1">
      <span
        onClick={() => updateSidebarOpen(true)}
        className="p-4 cursor-pointer rounded transition duration-500 ease-in-out hover:bg-black hover:bg-opacity-40"
      >
        <Icon name="Menu"></Icon>
      </span>
    </div>
  );
}
