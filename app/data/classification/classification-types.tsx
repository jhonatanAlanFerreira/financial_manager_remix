export const classificationIncludeOptions = ["transactions"] as const;
export type ClassificationIncludeOptions =
  (typeof classificationIncludeOptions)[number];
