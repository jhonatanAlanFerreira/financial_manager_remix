import { useState } from "react";
import InputPasswordPropsInterface from "./input-password-props-interface";
import InputText from "~/components/inputs/input-text/input-text";
import { IconNameType } from "~/shared/icon-name-type";

export default function InputPassword({
  showEyeIcon,
  ...rest
}: InputPasswordPropsInterface) {
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
