import { toast } from "react-hot-toast";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { Account } from "@prisma/client";
import { CompanyWithRelationsInterface } from "~/data/company/company-types";

export const createOrUpdateCompany = async (
  companyId: string | null,
  formData: FormData,
  callbacks: {
    onSuccess: (message: string) => void;
    onError: (errors: any) => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  const axiosRequest = companyId
    ? axios.patch(`/api/company?companyId=${companyId}`, formData)
    : axios.post("/api/company", formData);

  const loadingMessage = companyId ? "Updating company" : "Creating company";

  toast
    .promise(axiosRequest, {
      loading: loadingMessage,
      success: (res: AxiosResponse<ServerResponseInterface>) => {
        onSuccess(res.data.message as string);
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
    })
    .finally(onFinally);
};

export const fetchCompanies = async (): Promise<ServerResponseInterface<
  CompanyWithRelationsInterface[]
> | null> => {
  try {
    const response = await axios.get(`/api/company?extends=accounts`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      toast.error(
        error.response?.data.message || "Sorry, unexpected error. Be back soon"
      );
    } else {
      toast.error("Sorry, unexpected error. Be back soon");
    }
    return null;
  }
};

export const deleteCompany = async (
  companyId: string,
  callbacks: {
    onSuccess: () => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  toast
    .promise(axios.delete(`/api/company?companyId=${companyId}`), {
      loading: "Deleting company",
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

export const fetchAccounts = async (
  params: {
    paginationParams: string;
    searchParams: string;
  },
  callbacks: {
    onSuccess: (data: ServerResponseInterface<Account[]>) => void;
    onError: (errorMessage: string) => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { paginationParams, searchParams } = params;
  const { onSuccess, onError, onFinally } = callbacks;

  const url = `/api/account?${paginationParams}&${searchParams}`;

  try {
    const res = await axios.get<ServerResponseInterface<Account[]>>(url);
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

export const createOrUpdateAccount = async (
  accountId: string | null,
  formData: FormData,
  callbacks: {
    onSuccess: (message: string) => void;
    onError: (errors: any) => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  const axiosRequest = accountId
    ? axios.patch(`/api/account?accountId=${accountId}`, formData)
    : axios.post("/api/account", formData);

  const loadingMessage = accountId ? "Updating account" : "Creating account";

  toast
    .promise(axiosRequest, {
      loading: loadingMessage,
      success: (res: AxiosResponse<ServerResponseInterface>) => {
        onSuccess(res.data.message as string);
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
    })
    .finally(onFinally);
};

export const deleteAccount = async (
  accountId: string,
  callbacks: {
    onSuccess: () => void;
    onError: () => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;

  toast
    .promise(axios.delete(`/api/account?accountId=${accountId}`), {
      loading: "Deleting account",
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
