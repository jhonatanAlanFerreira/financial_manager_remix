export interface ServerResponseErrorInterface {
  errorCode?: number;
  errors?: {
    [key: string]: string;
  };
}
