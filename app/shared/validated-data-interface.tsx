export interface ValidatedDataInterface {
  isValid: boolean;
  errors?: {
    [key: string]: string;
  };
}
