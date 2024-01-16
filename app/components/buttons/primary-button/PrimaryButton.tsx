import Icon from "~/components/icon/Icon";
import PrimaryButtonProps from "~/interfaces/componentsProps/PrimaryButtonProps";

export default function PrimaryButton({
  text,
  iconName,
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      className="flex gap-3 text-white bg-violet-950 py-2 px-5 m-2 rounded"
      {...rest}
    >
      {text} {iconName && <Icon name={iconName}></Icon>}
    </button>
  );
}
