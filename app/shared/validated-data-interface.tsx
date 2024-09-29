export default interface ValidatedDataInterface {
  isValid: boolean;
  errors?: {
    [key: string]: string;
  };
}
