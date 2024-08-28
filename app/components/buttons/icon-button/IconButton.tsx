import Icon from "~/components/icon/Icon";
import IconButtonProps from "~/interfaces/componentsProps/buttons/IconButton";

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
