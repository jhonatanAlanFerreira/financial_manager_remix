import { Account } from "@prisma/client";
import { CompanyWithAccountsType } from "~/data/company/company-types";

export default interface AccountDropdownPropsInterface {
  company?: CompanyWithAccountsType;
  userAccounts?: Account[];
  onSave: () => void;
  onAccountRemove: () => void;
}
