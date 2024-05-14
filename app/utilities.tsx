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

export function formatDate(dateString: string) {
  if (!dateString) {
    return null;
  }
  return moment(dateString).format("YYYY/MM/DD");
}

export function todayFormatedDate() {
  return moment().format("YYYY-MM-DD");
}
