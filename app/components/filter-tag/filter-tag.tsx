import { FilterTagPropsInterface } from "~/components/filter-tag/filter-tag-props-interface";

export default function FilterTag({
  label,
  fieldName,
  value,
  closeBtn,
  onClose,
  ...rest
}: FilterTagPropsInterface) {
  return (
    <div className="flex space-x-2">
      <div
        {...rest}
        className={`flex items-center bg-violet-600 text-white text-sm font-semibold px-2 py-1 rounded-full ${rest.className}`}
      >
        <span className="text-violet-950 font-extrabold">
          {label}
          {value && <span>:</span>}
        </span>
        &nbsp;
        {value}
        {closeBtn && (
          <button
            onClick={() => onClose(fieldName)}
            className="ml-2 bg-violet-800 hover:bg-violet-950 text-white rounded-full w-5 h-5 flex items-center justify-center"
          >
            <span>x</span>
          </button>
        )}
      </div>
    </div>
  );
}
