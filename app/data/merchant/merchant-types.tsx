export const merchantIncludeOptions = ["transactions"] as const;
export type MerchantIncludeOptions = (typeof merchantIncludeOptions)[number];
