export const companyIncludeOptions = ["accounts"] as const;
export type CompanyIncludeOptions = (typeof companyIncludeOptions)[number];
