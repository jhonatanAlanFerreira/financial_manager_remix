import * as icons from "react-feather";
import { IconNameType } from "~/types/IconNameType";

export type IconPropsType = {
  name: IconNameType;
} & icons.IconProps;
