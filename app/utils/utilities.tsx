import moment from "moment-timezone";
import { useCallback, useEffect, useRef, useState } from "react";
import { parse } from "cookie";
import { LoaderFunctionArgs } from "@remix-run/node";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { BasePageStoreInterface } from "~/shared/base-page-store-interface";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function parseJsonOrNull(data: string) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function exclude<T, Key extends keyof T>(
  model: T,
  keys: Key[]
): Omit<T, Key> {
  return Object.fromEntries(
    Object.entries(model as { [s: string]: unknown }).filter(
      ([key]) => !keys.includes(key as Key)
    )
  ) as Omit<T, Key>;
}

export function queryParamsFromObject(
  obj: any,
  propertyForKey: {
    [key: string]: string;
  } | null = null
) {
  let newObject: any = {};

  for (let key in obj) {
    if (!!obj[key]) {
      if (propertyForKey?.[key]) {
        newObject[key] = obj[key][propertyForKey[key]];
      } else {
        newObject[key] = obj[key];
      }
    }
  }

  return new URLSearchParams(newObject as any).toString();
}

export function formatDate(dateString: string) {
  if (!dateString) {
    return null;
  }
  return moment(dateString).format("YYYY/MM/DD");
}

export function todayFormatedDate() {
  return moment().format("YYYY-MM-DD");
}

export function firstDayOfCurrentMonth(timezone?: string) {
  const currentMoment = timezone ? moment().tz(timezone) : moment();
  return currentMoment.startOf("month").format("YYYY-MM-DD");
}
export function lastDayOfCurrentMonth() {
  return moment().endOf("month").format("YYYY-MM-DD");
}

export function getBaseUrl() {
  const port = process.env.APP_PORT;
  const host =
    process.env.NODE_ENV === "production"
      ? process.env.APP_URL
      : `host.docker.internal:${port}`;
  return `http://${host}`;
}

export function parseIncludes<T extends readonly string[]>(
  url: URL,
  includeOptions: T
): T[number][] {
  const includesParam = url.searchParams.get("extends");
  if (!includesParam) return [];

  return includesParam
    .split(",")
    .filter((value): value is T[number] =>
      includeOptions.includes(value as T[number])
    );
}

export function getArrayFromFormData(
  formData: FormData,
  paramName: string
): string[] {
  const paramValue = formData.get(paramName);

  if (paramValue && paramValue !== "null") {
    return formData.getAll(paramName) as string[];
  }

  return [];
}

export function getOptionalField(
  body: FormData,
  field: string
): string | undefined {
  return body.get(field) ? String(body.get(field)) : undefined;
}

export const useDebouncedCallback = (callback: Function, delay = 300) => {
  const timeoutRef = useRef<any>();

  const debouncedFunction = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedFunction;
};

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

export function getTimezoneFromClientCookies({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = parse(cookieHeader);
  return cookies.timezone;
}

export const createBasePageStore = (
  set: any,
  get: any
): BasePageStoreInterface => ({
  loading: true,
  setLoading: (value: boolean) => set({ loading: value }),
  searchParams: "",
  setSearchParams: (value: string) => set({ searchParams: value }),
  getSearchParams: () => get().searchParams,
  isSubmitting: false,
  setIsSubmitting: (value: boolean) => set({ isSubmitting: value }),
  sortParams: "",
  setSortParams: (value: string) => set({ sortParams: value }),
  getSortParams: () => get().sortParams,
  totalPages: 0,
  setTotalPages: (value: number) => set({ totalPages: value }),
  currentPage: 1,
  setCurrentPage: (value: number) => set({ currentPage: value }),
  getCurrentPage: () => get().currentPage,
  responseErrors: {} as ServerResponseErrorInterface,
  setResponseErrors: (value: ServerResponseErrorInterface) =>
    set({ responseErrors: value }),
  modals: null as "filter" | "add" | "remove" | null,
  setModals: (value: "filter" | "add" | "remove" | null) =>
    set({ modals: value }),
});
