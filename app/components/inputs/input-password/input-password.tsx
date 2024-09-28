import { useState } from "react";
import { IconNameType } from "~/types/IconNameType";
import InputPasswordProps from "./input-password-props";
import InputText from "~/components/inputs/input-text/input-text";

export default function InputPassword({
  showEyeIcon,
  ...rest
}: InputPasswordProps) {
  const [isPassVisible, setIsPassVisible] = useState<boolean>();

  const icon = (): IconNameType | undefined => {
    if (!showEyeIcon) {
      return undefined;
    }

    return isPassVisible ? "EyeOff" : "Eye";
  };

  const onIconClicked = () => {
    setIsPassVisible(!isPassVisible);
  };

  return (
    <InputText
      type={isPassVisible ? "text" : "password"}
      {...rest}
      icon={icon()}
      onIconClicked={onIconClicked}
    ></InputText>
  );
}
