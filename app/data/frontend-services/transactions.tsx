import axios, { AxiosResponse, isAxiosError } from "axios";
import toast from "react-hot-toast";
import { ServerResponseInterface } from "~/shared/server-response-interface";

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
