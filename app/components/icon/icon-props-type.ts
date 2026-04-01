import * as icons from "react-feather";
import { IconNameType } from "~/shared/shared-types";

export type IconPropsType = {
  name: IconNameType;
} & icons.IconProps;
