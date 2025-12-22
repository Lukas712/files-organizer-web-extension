import { FileRuleSchema } from "./rule_schema";

export interface FolderRuleSchema {
  name: string;         
  enabled: boolean;       
  autoOrganize: boolean;
  conflictAction?: "uniquify";
  fileRules: FileRuleSchema[];
}
