import * as icons from "react-feather";
import { IconPropsType } from "~/components/icon/icon-props-type";

export function Icon({ name, ...rest }: IconPropsType) {
  const IconComponent = icons[name];
  return <IconComponent {...rest} />;
}
