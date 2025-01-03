import { Merchant } from "@prisma/client";
import axios, { AxiosResponse, isAxiosError } from "axios";
import toast from "react-hot-toast";
import { ServerResponseInterface } from "~/shared/server-response-interface";

export const fetchMerchants = async (
  params: { paginationParams: string; searchParams: string },
  callbacks: {
    onSuccess: (data: ServerResponseInterface<Merchant[]>) => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { paginationParams, searchParams } = params;
  const { onSuccess, onError, onFinally } = callbacks;

  try {
    const res = await axios.get<ServerResponseInterface<Merchant[]>>(
      `/api/merchant?${paginationParams}&${searchParams}`
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

export const createOrUpdateMerchant = async (
  formData: FormData,
  callbacks: {
    onSuccess: () => void;
    onError: (errors: Record<string, unknown>) => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  const isUpdate = formData.has("id") && !!formData.get("id");
  const merchantId = formData.get("id");
  const endpoint = isUpdate
    ? `/api/merchant?merchantId=${merchantId}`
    : "/api/merchant";

  const method = isUpdate ? axios.patch : axios.post;
  const loadingMessage = isUpdate ? "Updating merchant" : "Creating merchant";

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

export const deleteMerchant = async (
  merchantId: string,
  callbacks: {
    onSuccess: () => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  toast
    .promise(axios.delete(`/api/merchant?merchantId=${merchantId}`), {
      loading: "Deleting merchant",
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
