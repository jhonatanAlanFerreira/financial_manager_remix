import { AddButtonPropsInterface } from "~/components/buttons/add-button/add-button-props-interface";
import { IconButton } from "~/components/buttons/icon-button/icon-button";

export function AddButton({ ...params }: AddButtonPropsInterface) {
  return <IconButton iconName="PlusCircle" {...params}></IconButton>;
}
