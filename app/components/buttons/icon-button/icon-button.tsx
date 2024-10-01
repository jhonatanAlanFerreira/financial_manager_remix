import { Icon } from "~/components/icon/icon";
import { IconButtonPropsInterface } from "~/components/buttons/icon-button/icon-button-props-interface";

export function IconButton({
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
