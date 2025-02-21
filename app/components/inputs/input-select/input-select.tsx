import { forwardRef, useEffect, useId, useState } from "react";
import ReactSelect, {
  SelectInstance,
  StylesConfig,
  ActionMeta,
  GroupBase,
} from "react-select";
import { InputSelectPropsInterface } from "~/components/inputs/input-select/input-select-props-interface";
import Select from "react-select/base";

export const InputSelect = forwardRef<
  SelectInstance,
  InputSelectPropsInterface
>(({ dropdownPosition = "relative", onChange, ...rest }, ref) => {
  const inputId = useId();
  const [hasValue, setHasValue] = useState<boolean>(false);

  useEffect(() => {
    checkHasValue(rest.value);
  }, [rest.value]);

  const handleChange = (value: unknown, actionMeta: ActionMeta<unknown>) => {
    checkHasValue(value);
    if (onChange) {
      onChange(value, actionMeta);
    }
  };

  const checkHasValue = (value: unknown) => {
    setHasValue(!!value && (Array.isArray(value) ? !!value.length : true));
  };

  const styles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      border: "1px solid var(--primary-color) !important",
      minHeight: "3rem",
      height: "auto",
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
    option: (styles, state) => ({
      ...styles,
      color: state.isSelected ? "white" : "var(--primary-color)",
      backgroundColor: state.isSelected
        ? "var(--primary-color)"
        : state.isFocused
        ? "#d6c5f1"
        : "",
    }),
    menu: (styles) => ({
      ...styles,
      border: "1px solid var(--primary-color)",
      position: dropdownPosition,
      width: "95%",
      background: "#f2eaff",
      marginLeft: "2.5%",
    }),
  };

  return (
    <div className="relative float-label-input">
      <ReactSelect
        ref={ref as React.Ref<Select<unknown, boolean, GroupBase<unknown>>>}
        inputId={inputId}
        {...rest}
        styles={styles}
        onChange={handleChange}
        placeholder=" "
      />
      <label
        htmlFor={inputId}
        className={`${
          hasValue ? "has-value" : ""
        } text-violet-950 opacity-50 absolute top-3 left-0 pointer-events-none transition duration-200 ease-in-out bg-white px-2 text-grey-darker ml-1`}
      >
        {rest.placeholder}
      </label>
    </div>
  );
});

InputSelect.displayName = "InputSelect";
