import Icon from "~/components/icon/icon";
import IconButtonPropsInterface from "./icon-button-props-interface";

export default function IconButton({
  iconColor,
  iconName,
  ...rest
}: IconButtonPropsInterface) {
  return (
    <button
      className={`cursor-pointer transition-transform  transform hover:scale-110 ${rest.className}`}
      {...rest}
    >
      <Icon name={iconName} color={iconColor}></Icon>
    </button>
  );
}
