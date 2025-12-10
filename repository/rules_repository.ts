import { FileRuleSchema } from "../schemas/rule_schema.js";
import { FolderRuleSchema } from "../schemas/folder_schema.js";

export interface RulesRepository {
    saveRule(folderId: string, rule: FileRuleSchema): Promise<void>;
    findAllRules(): Promise<FolderRuleSchema[]>;
}