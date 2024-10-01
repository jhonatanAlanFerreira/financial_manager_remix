import Icon from "~/components/icon/icon";
import { PrimaryButtonPropsInterface } from "~/components/buttons/primary-button/primary-button-props-interface";

export default function PrimaryButton({
  text,
  iconName,
  ...rest
}: PrimaryButtonPropsInterface) {
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
