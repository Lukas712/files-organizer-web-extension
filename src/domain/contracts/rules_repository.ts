import { FolderRuleSchema } from "../../infrastructure/schemas/folder_schema";
import { FileRuleSchema } from "../../infrastructure/schemas/rule_schema";

export interface RulesRepository {
    saveRule(folderId: string, rule: FileRuleSchema): Promise<void>;
    findAllRules(): Promise<FolderRuleSchema[]>;
    saveRules(rules: FolderRuleSchema[]): Promise<void>;
}