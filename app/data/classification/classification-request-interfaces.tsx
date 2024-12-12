export interface ClassificationCreateRequestInterface {
  name: string;
  companies?: string[];
  is_personal: boolean;
  is_income: boolean;
}

export interface ClassificationUpdateRequestInterface
  extends ClassificationCreateRequestInterface {}