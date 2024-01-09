import InputPasswordProps from "~/interfaces/componentsProps/InputPasswordProps";
import InputText from "../inputText/InputText";
import { useState } from "react";
import { IconNameType } from "~/types/IconNameType";

export default function InputPassword({
  showEyeIcon,
  ...rest
}: InputPasswordProps) {
  const [isPassVisible, setIsPassVisible] = useState<boolean>();

  const icon = (): IconNameType | undefined => {
    if (!showEyeIcon) return undefined;
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
