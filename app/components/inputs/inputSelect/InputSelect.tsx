import React, { useEffect, useId, useRef, useState } from "react";
import Select, { StylesConfig, Props as SelectProps } from "react-select";

export default function InputSelect({ ...rest }: SelectProps) {
  const inputId = useId();
  const [hasValue, setHasValue] = useState(false);
  var selectRef = useRef(null);

  useEffect(() => {
    const select: any = selectRef.current;
    setHasValue(select.getValue().length);
  }, [(selectRef.current as any)?.getValue()]);

  const styles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      border: "1px solid var(--primary-color) !important",
      height: "3rem",
    }),
    singleValue: (styles) => ({
      ...styles,
      color: "var(--primary-color)",
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      color: "var(--primary-color)",
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      backgroundColor: "var(--primary-color)",
    }),
    placeholder: (styles) => ({
      ...styles,
      color: "var(--primary-color)",
      opacity: "0.8",
    }),
    option: (styles) => ({
      ...styles,
      color: "var(--primary-color)",
    }),
    menu: (styles) => ({
      ...styles,
      border: "1px solid var(--primary-color)",
    }),
  };

  return (
    <>
      <div className="relative float-label-input">
        <Select
          ref={selectRef}
          id={inputId}
          {...rest}
          styles={styles}
          placeholder=" "
        />
        <label
          htmlFor={inputId}
          className={`${
            hasValue ? "has-value" : ""
          } text-violet-950 opacity-50 absolute top-3 left-0 pointer-events-none transition duration-200 ease-in-outbg-white px-2 text-grey-darker`}
        >
          {rest.placeholder}
        </label>
      </div>
    </>
  );
}
