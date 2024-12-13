import { ServerResponseInterface } from "~/shared/server-response-interface";
import { ExpenseWithRelationsInterface } from "~/data/expense/expense-types";
import toast from "react-hot-toast";
import axios, { AxiosResponse, isAxiosError } from "axios";

export const fetchExpenses = async (
  params: { paginationParams: string; searchParams: string },
  callbacks: {
    onSuccess: (
      data: ServerResponseInterface<ExpenseWithRelationsInterface[]>
    ) => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { paginationParams, searchParams } = params;
  const { onSuccess, onError, onFinally } = callbacks;

  try {
    const res = await axios.get<
      ServerResponseInterface<ExpenseWithRelationsInterface[]>
    >(`/api/expense?${paginationParams}&${searchParams}&extends=companies`);

    onSuccess(res.data);
  } catch (error) {
    if (isAxiosError(error)) {
      toast.error(
        error.response?.data.message || "Sorry, unexpected error. Be back soon"
      );
    } else {
      toast.error("Sorry, unexpected error. Be back soon");
    }
    onError();
  } finally {
    onFinally();
  }
};

export const createOrUpdateExpense = async (
  formData: FormData,
  callbacks: {
    onSuccess: () => void;
    onError: (errors: Record<string, unknown>) => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  const isUpdate = formData.has("id") && !!formData.get("id");
  const expenseId = formData.get("id");
  const endpoint = isUpdate
    ? `/api/expense?expenseId=${expenseId}`
    : "/api/expense";

  const method = isUpdate ? axios.patch : axios.post;
  const loadingMessage = isUpdate ? "Updating expense" : "Creating expense";

  toast
    .promise(
      method(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
      {
        loading: loadingMessage,
        success: (res: AxiosResponse<ServerResponseInterface>) => {
          onSuccess();
          return res.data.message as string;
        },
        error: (error) => {
          if (isAxiosError(error)) {
            onError(error.response?.data.serverError || {});
            return (
              error.response?.data.message ||
              "Sorry, unexpected error. Be back soon"
            );
          }
          return "Sorry, unexpected error. Be back soon";
        },
      }
    )
    .finally(() => {
      onFinally();
    });
};

export const deleteExpense = async (
  expenseId: string,
  callbacks: {
    onSuccess: () => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  toast
    .promise(axios.delete(`/api/expense?expenseId=${expenseId}`), {
      loading: "Deleting expense",
      success: (res: AxiosResponse<ServerResponseInterface>) => {
        onSuccess();
        return res.data.message as string;
      },
      error: (error) => {
        if (isAxiosError(error)) {
          onError();
          return (
            error.response?.data.message ||
            "Sorry, unexpected error. Be back soon"
          );
        }
        return "Sorry, unexpected error. Be back soon";
      },
    })
    .finally(onFinally);
};