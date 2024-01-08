import ValidatedData from "~/interfaces/ValidatedData";

export function parseJsonOrNull(data: string) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function getError(validatedData: ValidatedData, errorName: string) {
  return validatedData?.errors?.find((error) => error.name == errorName)?.error;
}
