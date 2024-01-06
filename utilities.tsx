export function parseJsonOrNull(data: string) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}
