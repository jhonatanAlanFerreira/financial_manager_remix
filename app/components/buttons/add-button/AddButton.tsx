import AddButtonProps from "~/interfaces/componentsProps/buttons/AddButtonProps";
import IconButton from "../icon-button/IconButton";

export default function AddButton({ ...params }: AddButtonProps) {
  return <IconButton iconName="PlusCircle" {...params}></IconButton>;
}
