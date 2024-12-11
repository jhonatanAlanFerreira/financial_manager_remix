import { ServerResponseInterface } from "~/shared/server-response-interface";
import { ClassificationWithRelationsInterface } from "~/data/classification/classification-types";
import axios, { AxiosResponse, isAxiosError } from "axios";
import toast from "react-hot-toast";

export const fetchClassifications = async (
  params: {
    paginationParams: string;
    searchParams: string;
    extends?: string;
  },
  callbacks: {
    onSuccess: (
      data: ServerResponseInterface<ClassificationWithRelationsInterface[]>
    ) => void;
    onError: (errorMessage: string) => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { paginationParams, searchParams, extends: extendsParams } = params;
  const { onSuccess, onError, onFinally } = callbacks;

  const url = `/api/classification?${paginationParams}&${searchParams}${
    extendsParams ? `&extends=${extendsParams}` : ""
  }`;

  try {
    const res = await axios.get<
      ServerResponseInterface<ClassificationWithRelationsInterface[]>
    >(url);
    onSuccess(res.data);
  } catch (error) {
    if (isAxiosError(error)) {
      onError(
        error.response?.data.message || "Sorry, unexpected error. Be back soon"
      );
    } else {
      onError("Sorry, unexpected error. Be back soon");
    }
  } finally {
    onFinally();
  }
};

export const createOrUpdateClassification = async (
  formData: FormData,
  callbacks: {
    onSuccess: () => void;
    onError: (errors: Record<string, unknown>) => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  const isUpdate = formData.has("id") && !!formData.get("id");
  const classificationId = formData.get("id");
  const endpoint = isUpdate
    ? `/api/classification?classificationId=${classificationId}`
    : "/api/classification";

  const method = isUpdate ? axios.patch : axios.post;
  const loadingMessage = isUpdate
    ? "Updating classification"
    : "Creating classification";

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

export const deleteClassification = async (
  classificationId: string,
  callbacks: {
    onSuccess: () => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  toast
    .promise(
      axios.delete(`/api/classification?classificationId=${classificationId}`),
      {
        loading: "Deleting classification",
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
      }
    )
    .finally(onFinally);
};
