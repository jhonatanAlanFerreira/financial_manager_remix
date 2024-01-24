import Select, { StylesConfig, Props as SelectProps } from "react-select";

export default function InputSelect({ ...rest }: SelectProps) {
  const styles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      border: "1px solid var(--primary-color) !important",
      height: "3rem",
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
      position: "relative",
    }),
  };

  return <Select {...rest} styles={styles} />;
}
