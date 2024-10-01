import Icon from "~/components/icon/icon";
import { PaginationPropsInterface } from "~/components/pagination/pagination-props-interface";

export default function Pagination({
  currentPage,
  totalPages,
  optionsAmount,
  onPageChange,
  ...rest
}: PaginationPropsInterface) {
  const calculatePaginationRange = (
    totalPages: number,
    optionsAmount: number,
    currentPage: number
  ) => {
    const beforeAmount = Math.floor(optionsAmount / 2);
    const afterAmount = optionsAmount - beforeAmount - 1;

    let begin = Math.max(1, currentPage - beforeAmount);
    let end = Math.min(totalPages, currentPage + afterAmount);

    if (begin == 1) {
      end = Math.min(totalPages, optionsAmount);
    } else if (end == totalPages) {
      begin = Math.max(1, totalPages - optionsAmount + 1);
    }

    return Array.from({ length: end - begin + 1 }, (_, i) => begin + i);
  };

  const options = calculatePaginationRange(
    totalPages,
    optionsAmount,
    currentPage
  );

  return (
    <>
      {!!totalPages && (
        <div
          {...rest}
          className={`flex flex-wrap text-violet-950 ${rest.className}`}
        >
          {currentPage != 1 && (
            <button
              onClick={() => onPageChange(--currentPage)}
              className="mr-3 transition-transform  transform hover:scale-110"
            >
              <Icon name="ArrowLeft"></Icon>
            </button>
          )}
          {options[0] > 1 && (
            <div className="flex mt-3">
              <span
                onClick={() => onPageChange(1)}
                className="p-1 cursor-pointer transition-transform  transform hover:scale-110"
              >
                1
              </span>
              <span className="ml-3 p-1">
                <Icon name="MoreHorizontal"></Icon>
              </span>
            </div>
          )}
          {options.map((option, i) => {
            return (
              <div
                key={i}
                onClick={() => onPageChange(option)}
                className={`m-3 ${
                  option == currentPage
                    ? "bg-violet-950 text-white rounded p-1"
                    : "p-1 cursor-pointer transition-transform  transform hover:scale-110"
                }`}
              >
                {option}
              </div>
            );
          })}
          {options[options.length - 1] != totalPages && (
            <div className="flex mt-3">
              <span className="mr-3 p-1">
                <Icon name="MoreHorizontal"></Icon>
              </span>
              <span
                onClick={() => onPageChange(totalPages)}
                className="p-1 cursor-pointer transition-transform  transform hover:scale-110"
              >
                {totalPages}
              </span>
            </div>
          )}
          {currentPage != totalPages && (
            <button
              onClick={() => onPageChange(++currentPage)}
              className="ml-3 transition-transform  transform hover:scale-110"
            >
              <Icon name="ArrowRight"></Icon>
            </button>
          )}
        </div>
      )}
    </>
  );
}
