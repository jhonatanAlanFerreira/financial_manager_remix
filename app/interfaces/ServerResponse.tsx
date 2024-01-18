export default interface ServerResponse<T = any> {
  error?: boolean;
  message?: string;
  data?: T;
}
