export default interface ValidatedData {
  isValid: boolean;
  errors?: {
    [key: string]: string;
  };
}
