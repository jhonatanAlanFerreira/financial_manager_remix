import { useId } from "react";
import InputTextProps from "~/interfaces/componentsProps/InputTextProps";

export default function InputText({ label, ...rest }: InputTextProps) {
  const inputId = useId();

  return (
    <div className="relative float-label-input">
      <input
        type="text"
        id={inputId}
        placeholder=" "
        className="block w-full bg-white focus:outline-none focus:shadow-outline border border-violet-950 rounded-md py-3 px-3 block appearance-none leading-normal text-violet-950"
        {...rest}
      ></input>
      <label
        htmlFor={inputId}
        className="absolute top-3 left-0 text-violet-950 pointer-events-none transition duration-200 ease-in-outbg-white px-2 text-grey-darker"
      >
        {label}
      </label>
    </div>
  );
}
