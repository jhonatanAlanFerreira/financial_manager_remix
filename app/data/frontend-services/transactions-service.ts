import axios, { AxiosResponse, isAxiosError } from "axios";
import toast from "react-hot-toast";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { TransactionsWithTotalsInterface } from "~/data/transaction/transaction-types";

export const createOrUpdateTransaction = async (
  formData: FormData,
  callbacks: {
    onSuccess: () => void;
    onError: (errors: Record<string, unknown>) => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  const isUpdate = formData.has("id") && !!formData.get("id");
  const transactionId = formData.get("id");
  const endpoint = isUpdate
    ? `/api/transaction?transactionId=${transactionId}`
    : "/api/transaction";

  const method = isUpdate ? axios.patch : axios.post;
  const loadingMessage = isUpdate
    ? "Updating transaction"
    : "Creating transaction";

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
    .finally(onFinally);
};

export const fetchTransactions = async (
  params: string,
  callbacks: {
    onSuccess: (
      data: ServerResponseInterface<TransactionsWithTotalsInterface>,
      totalPages: number
    ) => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  try {
    const res = await axios.get<
      ServerResponseInterface<TransactionsWithTotalsInterface>
    >(`/api/transaction?${params}`);
    const { data } = res;

    onSuccess(data, data.pageInfo?.totalPages || 1);
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

export const fetchTransactionsCSV = async (
  params: string,
  callbacks: {
    onSuccess: (data: ServerResponseInterface<string>) => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  try {
    const res = await axios.get<ServerResponseInterface<string>>(
      `/api/transaction/export?${params}`
    );
    const { data } = res;

    onSuccess(data);
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

export const deleteTransaction = async (
  transactionId: string,
  callbacks: {
    onSuccess: () => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  toast
    .promise(axios.delete(`/api/transaction?transactionId=${transactionId}`), {
      loading: "Deleting transaction",
      success: (res: AxiosResponse<ServerResponseInterface>) => {
        onSuccess();
        return res.data.message as string;
      },
      error: (error) => {
        if (isAxiosError(error)) {
          return (
            error.response?.data.message ||
            "Sorry, unexpected error. Be back soon"
          );
        }
        return "Sorry, unexpected error. Be back soon";
      },
    })
    .catch(() => {
      onError();
    })
    .finally(onFinally);
};
