import { FileSchema } from "../../infrastructure/schemas/file_schema.js";
import { FileRuleSchema } from "../../infrastructure/schemas/rule_schema.js";

export interface OrganizeStrategy {
    supportsFile(file: FileSchema): FileRuleSchema | null;
    organize(file: FileSchema): string;
}