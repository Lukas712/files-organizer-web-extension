import { RulesRepository } from "./rules_repository.js";
import { RuleSchema } from "../schemas/rule_schema.js";
import { ExtensionStrategy } from "../controller/extension_strategy.js";
import { FolderSchema } from "../schemas/folder_schema.js";

const DEFAULT_RULES: RuleSchema[] = [
  { extension: "pdf", folderName: "PDFs" },
  { extension: "jpg", folderName: "Images" },
  { extension: "png", folderName: "Images" },
  { extension: "jpeg", folderName: "Images/Test" },
  { extension: "zip", folderName: "Zips" }
];

export class WebRulesRepository implements RulesRepository {
    async saveRule(rule: RuleSchema): Promise<void> {
        const rules: RuleSchema[] = await this.findAllRules();
        rules.push(rule);
        await chrome.storage.local.set({ rules });
    }

    async findAllRules(): Promise<RuleSchema[]> {
        const result = await chrome.storage.local.get<{ rules?: RuleSchema[] }>(["rules"]);
        return result.rules ?? [];
    }

    public ruleToStrategy(rule: RuleSchema): ExtensionStrategy {
        const folder: FolderSchema = { name: rule.folderName };
        return new ExtensionStrategy(rule.extension, folder);
    }

    async seedIfEmpty(): Promise<void> {
        const rules = await this.findAllRules();

        if (rules.length === 0) {
            console.log("Nenhuma regra encontrada. Criando regras padrão...");
            await chrome.storage.local.set({
                rules: DEFAULT_RULES
            });
        }
    }
}