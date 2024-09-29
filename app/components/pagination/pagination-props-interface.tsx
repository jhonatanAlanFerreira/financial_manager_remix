import { HTMLAttributes } from "react";

export default interface PaginationPropsInterface extends HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  optionsAmount: number;
  onPageChange: (page: number) => void;
}
