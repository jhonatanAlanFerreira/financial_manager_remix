import { HTMLAttributes } from "react";

export default interface PaginationProps extends HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  optionsAmount: number;
  onPageChange: (page: number) => void;
}
