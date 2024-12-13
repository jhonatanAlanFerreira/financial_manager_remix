import moment from "moment";
import { useCallback, useRef } from "react";

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

export function firstDayOfCurrentMonth() {
  return moment().startOf("month").format("YYYY-MM-DD");
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

export const useDebouncedCallback = (callback: Function, delay: number) => {
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
