import * as icons from "react-feather";
import { IconNameType } from "~/shared/icon-name-type";

export type IconPropsType = {
  name: IconNameType;
} & icons.IconProps;
