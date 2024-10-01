import Icon from "~/components/icon/icon";
import { DangerButtonPropsInterface } from "~/components/buttons/danger-button/danger-button-props.interface";

export default function DangerButton({
  text,
  iconName,
  ...rest
}: DangerButtonPropsInterface) {
  return (
    <button
      {...rest}
      className={`flex gap-3 justify-center text-white bg-red-700 py-2 px-5 m-2 rounded shadow shadow-gray-950 transform transition-transform duration-300 hover:scale-110 ${rest.className}`}
      style={{ minWidth: "7rem" }}
    >
      {text} {iconName && <Icon name={iconName}></Icon>}
    </button>
  );
}
