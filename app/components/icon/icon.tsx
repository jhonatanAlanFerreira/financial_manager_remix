import * as icons from "react-feather";
import { IconPropsType } from "./icon-props-type";

export default function Icon({ name, ...rest }: IconPropsType) {
  const IconComponent = icons[name];
  return <IconComponent {...rest} />;
}
