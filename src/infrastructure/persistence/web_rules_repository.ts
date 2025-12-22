import { RulesRepository } from "../../domain/contracts/rules_repository.js";
import { FileRuleSchema } from "../schemas/rule_schema.js";
import { FolderStrategy } from "../../domain/strategies/folder_strategy.js";
import { FolderRuleSchema } from "../schemas/folder_schema.js";

export const DEFAULT_FOLDERS: FolderRuleSchema[] = [
  {
    name: "Documents",
    enabled: true,
    autoOrganize: true,
    fileRules: [
      { extension: "pdf", mime: "application/pdf", ruleName: "PDFs rule", ruleDescription: "Organize PDFs" },
    ]
  },
  {
    name: "Images",
    enabled: true,
    autoOrganize: true,
    fileRules: [
      { mime: "image/jpeg", ruleName: "JPGs rule", ruleDescription: "Organize JPEG images" },
      { mime: "image/jpeg", ruleName: "JPEGs rule", ruleDescription: "Organize JPEG images" },
      { mime: "image/png", ruleName: "PNGs rule", ruleDescription: "Organize PNG images"}
    ]
  },
  {
    name: "Archives",
    enabled: true,
    autoOrganize: true,
    fileRules: [
      { mime: "application/zip", ruleName: "ZIPs rule", ruleDescription: "Organize ZIP archives" },
    ]
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
}