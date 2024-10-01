import { useId } from "react";
import { Icon } from "~/components/icon/icon";
import { InputTextPropsInterface } from "~/components/inputs/input-text/input-text-props-interface";

export function InputText({
  label,
  errorMessage,
  icon,
  onIconClicked,
  ...rest
}: InputTextPropsInterface) {
  const inputId = useId();

  return (
    <div className="relative float-label-input">
      <input
        type="text"
        id={inputId}
        placeholder=" "
        className={`block w-full bg-white focus:outline-none focus:shadow-outline border rounded-md py-3 px-3 appearance-none leading-normal text-violet-950 ${
          errorMessage ? "border-rose-500" : "border-violet-950"
        }`}
        autoComplete="off"
        {...rest}
      ></input>
      <label
        htmlFor={inputId}
        className={`absolute top-3 left-0 pointer-events-none transition duration-200 ease-in-outbg-white px-2 text-grey-darker ${
          errorMessage ? "text-rose-500" : "text-violet-950"
        }`}
      >
        {label}
      </label>
      {icon && (
        <Icon
          name={icon}
          className="absolute top-3 right-4 text-violet-950 cursor-pointer"
          onClick={onIconClicked}
        ></Icon>
      )}
      {errorMessage && <p className="text-rose-500">* {errorMessage}</p>}
    </div>
  );
}
