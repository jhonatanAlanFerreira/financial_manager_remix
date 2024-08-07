import Icon from "~/components/icon/Icon";
import PrimaryButtonProps from "~/interfaces/componentsProps/PrimaryButtonProps";

export default function PrimaryButton({
  text,
  iconName,
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      {...rest}
      className={`flex justify-center gap-3 text-white bg-violet-950 py-2 px-5 m-2 rounded shadow shadow-gray-950 transform transition-transform duration-300 hover:scale-110 ${rest.className}`}
      style={{ minWidth: "7rem" }}
    >
      {text} {iconName && <Icon name={iconName}></Icon>}
    </button>
  );
}
