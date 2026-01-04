import { RulesRepository } from "../../domain/contracts/rules_repository.js";
import { FileRuleSchema } from "../schemas/rule_schema.js";
import { FolderStrategy } from "../../domain/strategies/folder_strategy.js";
import { FolderRuleSchema } from "../schemas/folder_schema.js";

export const DEFAULT_FOLDERS: FolderRuleSchema[] = [
  {
    name: "Documents",
    enabled: true,
    fileRules: [
      {mime: "application/pdf", ruleName: "PDFs rule", ruleDescription: "Organize PDFs", enabled: true },
    ],
    conflictAction: "uniquify"
  },
  {
    name: "Images",
    enabled: true,
    fileRules: [
      { mime: "image/*", ruleName: "All images rule", ruleDescription: "Organize JPEG images", enabled: true },
    ],
    conflictAction: "uniquify"
  },
  {
    name: "Archives",
    enabled: true,
    fileRules: [
      { mime: "application/zip", ruleName: "ZIPs rule", ruleDescription: "Organize ZIP archives", enabled: true },
    ],
    conflictAction: "uniquify"
  }
];


export class WebRulesRepository implements RulesRepository {
    async saveRule(folderId: string, rule: FileRuleSchema): Promise<void> {
        const folders= await this.findAllRules();

        if (rule.extension) {
            const conflict = folders.some(f =>
            f.fileRules?.some(r => r.extension === rule.extension && f.name !== folderId)
            );

            if (conflict) {
            throw new Error("Essa extensão já está associada a outra pasta.");
            }
        }

        const folder = folders.find(f => f.name === folderId)!;
        folder.fileRules?.push(rule);

        await chrome.storage.local.set({ rules: folders });
    }

    async findAllRules(): Promise<FolderRuleSchema[]> {
        const result = await chrome.storage.local.get<{ rules?: FolderRuleSchema[] }>(["rules"]);
        return result.rules ?? [];
    }

    public ruleToStrategy(rule: FolderRuleSchema): FolderStrategy {
        return new FolderStrategy(rule);
    }

    async seedIfEmpty(): Promise<void> {
        const rules = await this.findAllRules();

        if (rules.length === 0) {
            console.log("Nenhuma regra encontrada. Criando regras padrão...");
            await chrome.storage.local.set({
                rules: DEFAULT_FOLDERS
            });
        }
    }

    async saveRules(rules: FolderRuleSchema[]): Promise<void> {
        await chrome.storage.local.set({ rules });
    }
}