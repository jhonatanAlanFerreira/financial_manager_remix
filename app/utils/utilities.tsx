import moment from "moment";

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
