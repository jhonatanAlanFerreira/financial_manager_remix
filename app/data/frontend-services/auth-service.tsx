import { toast } from "react-hot-toast";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { ServerResponseInterface } from "~/shared/server-response-interface";

export const signup = async (
  formData: FormData,
  callbacks: {
    onSuccess: (message: string) => void;
    onError: (errors: any) => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;
  const axiosRequest = axios.post("/api/signup", formData);
  const loadingMessage = "Creating new user";

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

export const login = async (
  formData: FormData,
  callbacks: {
    onSuccess: (message: string) => void;
    onFinally: () => void;
  }
): Promise<void> => {
  const { onSuccess, onFinally } = callbacks;
  const axiosRequest = axios.post("/api/login", formData);
  const loadingMessage = "Logging in";

  toast
    .promise(axiosRequest, {
      loading: loadingMessage,
      success: (res: AxiosResponse<ServerResponseInterface>) => {
        onSuccess(res.data.message as string);
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
    .finally(onFinally);
};

export const signupAsGuest = async (callbacks: {
  onSuccess: (message: string) => void;
  onError: (errors: any) => void;
  onFinally: () => void;
}): Promise<void> => {
  const { onSuccess, onError, onFinally } = callbacks;
  const axiosRequest = axios.post("/api/signup/guest");
  const loadingMessage = "Creating new guest";

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
