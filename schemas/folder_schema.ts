import { FileRuleSchema } from "./rule_schema";

export interface FolderRuleSchema {
  id: string;
  name: string;         
  enabled: boolean;       
  autoOrganize: boolean;
  conflictAction?: "uniquify";
  fileRules?: FileRuleSchema[];
}
