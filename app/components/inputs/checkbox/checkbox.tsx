import { InputHTMLAttributes } from "react";

export function Checkbox({
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      className={`accent-violet-950 w-4 h-4 bg-gray-100 border-gray-300 rounded ${props.className}`}
    />
  );
}
