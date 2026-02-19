export interface ServerResponseErrorInterface {
  errorCode?: number;
  message?: string;
  errors?: {
    [key: string]: string;
  };
}
