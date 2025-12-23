import { FolderRuleSchema } from "../../infrastructure/schemas/folder_schema";
import { FormStrategy } from "./form_strategy";

export class FormController {
  constructor(private strategy: FormStrategy) {}
}
