import { TextAreaPropsInterface } from "~/components/inputs/text-area/text-area-props-interface";
import { forwardRef, useId } from "react";

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaPropsInterface>(
  ({ label, errorMessage, ...rest }, ref) => {
    const inputId = useId();

    return (
      <div className="relative float-label-input">
        <textarea
          ref={ref}
          id={inputId}
          placeholder=" "
          className={`block w-full bg-white focus:outline-none focus:shadow-outline border rounded-md py-3 px-3 appearance-none leading-normal text-violet-950 ${
            errorMessage ? "border-rose-500" : "border-violet-950"
          }`}
          autoComplete="off"
          {...rest}
        ></textarea>
        <label
          htmlFor={inputId}
          className={`absolute top-3 left-0 pointer-events-none transition duration-200 ease-in-outbg-white px-2 text-grey-darker ${
            errorMessage ? "text-rose-500" : "text-violet-950 opacity-60"
          }`}
        >
          {label}
        </label>
        {errorMessage && <p className="text-rose-500">* {errorMessage}</p>}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
