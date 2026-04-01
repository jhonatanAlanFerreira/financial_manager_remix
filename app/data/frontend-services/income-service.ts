import axios, { AxiosResponse, isAxiosError } from "axios";
import toast from "react-hot-toast";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { IncomeWithRelationsInterface } from "~/data/income/income-types";

export const createOrUpdateIncome = async (
  formData: FormData,
  callbacks: {
    onSuccess: () => void;
    onError: (errors: Record<string, unknown>) => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  const isUpdate = formData.has("id") && !!formData.get("id");
  const incomeId = formData.get("id");
  const endpoint = isUpdate
    ? `/api/income?incomeId=${incomeId}`
    : "/api/income";

  const method = isUpdate ? axios.patch : axios.post;
  const loadingMessage = isUpdate ? "Updating income" : "Creating income";

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

export const fetchIncomes = async (
  params: {
    paginationParams: string;
    searchParams: string;
    sortParams?: string;
  },
  callbacks: {
    onSuccess: (
      data: ServerResponseInterface<IncomeWithRelationsInterface[]>
    ) => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { paginationParams, searchParams, sortParams } = params;
  const { onSuccess, onError, onFinally } = callbacks;

  try {
    const res = await axios.get<
      ServerResponseInterface<IncomeWithRelationsInterface[]>
    >(
      `/api/income?${paginationParams}&${searchParams}&${sortParams}&extends=companies`
    );

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

export const deleteIncome = async (
  incomeId: string,
  callbacks: {
    onSuccess: () => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  toast
    .promise(axios.delete(`/api/income?incomeId=${incomeId}`), {
      loading: "Deleting income",
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
