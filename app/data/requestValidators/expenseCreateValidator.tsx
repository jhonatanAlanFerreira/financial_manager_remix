import ValidatedData from "~/interfaces/ValidatedData";
import ExpenseCreateRequest from "~/interfaces/bodyRequests/ExpenseCreateRequest";

export async function ExpenseCreateValidator(
  data: ExpenseCreateRequest
): Promise<ValidatedData> {
  return {
    isValid: true,
  };
}
