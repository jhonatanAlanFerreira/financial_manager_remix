import ServerResponse from "~/interfaces/ServerResponse";
import ExpenseCreateRequest from "~/interfaces/bodyRequests/ExpenseCreateRequest";
import { ExpenseCreateValidator } from "./requestValidators/expenseCreateValidator";

export async function create(
  data: ExpenseCreateRequest
): Promise<ServerResponse> {
  const dataIsValid = await ExpenseCreateValidator(data);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  return {};
}
