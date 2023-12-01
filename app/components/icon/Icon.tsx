import * as icons from "react-feather";
import { IconPropsType } from "~/types/IconPropsType";

export function Icon({ name, ...rest }: IconPropsType) {
  const IconComponent = icons[name];
  return <IconComponent {...rest} />;
}
