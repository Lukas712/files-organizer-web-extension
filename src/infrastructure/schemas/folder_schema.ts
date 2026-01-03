import { FileRuleSchema } from "./rule_schema";

export interface FolderRuleSchema {
  name: string;         
  enabled: boolean;       
  conflictAction?: "uniquify" | "overwrite";
  fileRules: FileRuleSchema[];
}
