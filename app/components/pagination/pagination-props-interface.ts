import { HTMLAttributes } from "react";

export interface PaginationPropsInterface extends HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  optionsAmount: number;
  onPageChange: (page: number) => void;
}
