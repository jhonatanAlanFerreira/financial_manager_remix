export default interface ValidatedData {
  isValid: boolean;
  errors?: {
    name: string;
    error: string;
  }[];
}
