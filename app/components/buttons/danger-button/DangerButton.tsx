import Icon from "~/components/icon/Icon";
import DangerButtonProps from "~/interfaces/componentsProps/DangerButtonProps";

export default function DangerButton({
  text,
  iconName,
  className,
  ...rest
}: DangerButtonProps) {
  const existingClasses =
    "flex gap-3 justify-center text-white bg-red-700 py-2 px-5 m-2 rounded shadow shadow-gray-950 transform transition-transform duration-300 hover:scale-110";
  const combinedClasses = `${existingClasses} ${className}`;

  return (
    <button className={combinedClasses} style={{ minWidth: "7rem" }} {...rest}>
      {text} {iconName && <Icon name={iconName}></Icon>}
    </button>
  );
}
