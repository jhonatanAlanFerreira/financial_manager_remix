import IconButton from "../icon-button/icon-button";
import AddButtonProps from "./add-button-props-interface";

export default function AddButton({ ...params }: AddButtonProps) {
  return <IconButton iconName="PlusCircle" {...params}></IconButton>;
}
