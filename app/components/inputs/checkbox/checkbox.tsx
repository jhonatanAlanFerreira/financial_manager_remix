import { forwardRef, InputHTMLAttributes } from "react";

export const Checkbox = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      {...props}
      className={`accent-violet-950 w-4 h-4 bg-gray-100 border-gray-300 rounded ${className}`}
    />
  );
});

Checkbox.displayName = "Checkbox";
