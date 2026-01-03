import { FolderRuleSchema } from "../infrastructure/schemas/folder_schema.js";
import { FileRuleSchema } from "../infrastructure/schemas/rule_schema.js";
import { Toast } from "./components/toast.js";

export class RulesValidator {
  static validate(rules: FolderRuleSchema[]): void {
    this.validateNoDuplicateRules(rules);
    this.verifyRuleWorking(rules);
  }

  static verifyRuleWorking(rules: FolderRuleSchema[]): void {
    const allRules: { folderName: string; rule: FileRuleSchema }[] = [];

    for (const folder of rules) {
      if (folder.fileRules) {
        for (const rule of folder.fileRules) {
          allRules.push({ folderName: folder.name, rule });
        }
      }
    }

    for (let i = 0; i < allRules.length; i++) {
      const topRule = allRules[i];

      for (let j = i + 1; j < allRules.length; j++) {
        const bottomRule = allRules[j];
        if (
          topRule.rule.enabled &&
          bottomRule.rule.enabled &&
          this.isWorking(topRule.rule, bottomRule.rule)
        ) {
          Toast.show(
            `Aviso: A regra "${bottomRule.rule.ruleName}" em "${bottomRule.folderName}" ` +
              `nunca será atingida pois a regra "${topRule.rule.ruleName}" em "${topRule.folderName}" é mais genérica.`,
            "warning"
          );
        }
      }
    }
  }

  static isWorking(parent: FileRuleSchema, child: FileRuleSchema): boolean {
    const isMoreGeneric = (p: string | undefined, c: string | undefined) => {
      if (!p) return true;
      if (p === "*") return true;
      if (p === c) return true;
      if (p.endsWith("/*") && c?.startsWith(p.replace("/*", ""))) return true;
      return false;
    };

    return (
      isMoreGeneric(parent.extension, child.extension) &&
      isMoreGeneric(parent.mime, child.mime)
    );
  }

  static validateNoDuplicateRules(rules: FolderRuleSchema[]): void {
    const seen = new Map<string, { folder: string; name?: string }>();

    const allRules = this.flattenRules(rules);

    for (const { folder, rule } of allRules) {
      const key = this.normalizeRule(rule);

      if (
        key ===
        JSON.stringify({
          extension: "",
          mime: "",
          referrer: "",
          url: "",
          finalUrl: "",
          fileName: "",
        })
      ) {
        continue;
      }

      const prev = seen.get(key);
      if (prev) {
        throw new Error(`Regra duplicada: "${rule.ruleName ?? "(sem nome)"}" ` +
            `em "${folder}" é equivalente à "${
              prev.name ?? "(sem nome)"
            }" em "${prev.folder}".`);
      }

      seen.set(key, { folder, name: rule.ruleName });
    }
  }

  private static normalizeRule(rule: FileRuleSchema): string {
    const pick = (v?: string) => (v ?? "").trim().toLowerCase();

    return JSON.stringify({
      extension: pick(rule.extension),
      mime: pick(rule.mime),
      referrer: pick(rule.referrer),
      url: pick(rule.url),
      finalUrl: pick(rule.finalUrl),
      fileName: pick(rule.fileName),
    });
  }

  private static flattenRules(
    folders: FolderRuleSchema[],
    acc: { folder: string; rule: FileRuleSchema }[] = []
  ): { folder: string; rule: FileRuleSchema }[] {
    for (const folder of folders) {
      for (const rule of folder.fileRules ?? []) {
        acc.push({ folder: folder.name, rule });
      }
      if (folder.folders) {
        this.flattenRules(folder.folders, acc);
      }
    }
    return acc;
  }
}
