import { RuleSchema } from "../schemas/rule_schema.js";

export interface RulesRepository {
    saveRule(rule: RuleSchema): Promise<void>;
    findAllRules(): Promise<RuleSchema[]>;
}