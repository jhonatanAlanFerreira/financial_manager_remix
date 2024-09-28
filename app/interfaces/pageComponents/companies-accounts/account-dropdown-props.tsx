import { Account } from "@prisma/client";
import { CompanyWithAccounts } from "~/interfaces/prismaModelDetails/company";

export default interface AccountDropdownProps {
  company?: CompanyWithAccounts;
  userAccounts?: Account[];
  onSave: () => void;
  onAccountRemove: () => void;
}
