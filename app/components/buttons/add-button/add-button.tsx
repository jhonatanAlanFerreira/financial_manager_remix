import IconButton from "../icon-button/icon-button";
import AddButtonPropsInterface from "./add-button-props-interface";

export default function AddButton({ ...params }: AddButtonPropsInterface) {
  return <IconButton iconName="PlusCircle" {...params}></IconButton>;
}
