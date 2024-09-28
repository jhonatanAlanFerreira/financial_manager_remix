export interface ClassificationCreateRequestInterface {
  name: string;
  companies?: string[];
  is_personal_transaction_classification: boolean;
  is_income: boolean;
}

export interface ClassificationUpdateRequestInterface
  extends ClassificationCreateRequestInterface {}