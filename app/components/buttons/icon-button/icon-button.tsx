import Icon from "~/components/icon/icon";
import IconButtonProps from "./icon-button-props";

export default function IconButton({
  iconColor,
  iconName,
  ...rest
}: IconButtonProps) {
  return (
    <button
      className={`cursor-pointer transition-transform  transform hover:scale-110 ${rest.className}`}
      {...rest}
    >
      <Icon name={iconName} color={iconColor}></Icon>
    </button>
  );
}
