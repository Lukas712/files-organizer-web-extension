import { FolderRuleSchema } from "../../infrastructure/schemas/folder_schema.js";
import { FileRuleSchema } from "../../infrastructure/schemas/rule_schema.js";
import { Toast } from "../../ui/components/toast.js";

export class RulesValidator {
  static validate(rules: FolderRuleSchema[]): void {
    this.verifyRuleWorking(rules);
  }

  private static verifyRuleWorking(rules: FolderRuleSchema[]): void {
    const allRules: { folderName: string; rule: FileRuleSchema }[] = [];
    for (const folder of rules) {
      if (folder.fileRules) {
        for (const rule of folder.fileRules) {
          allRules.push({ folderName: folder.name, rule });
        }
      }
    }

    for (let i = 0; i < allRules.length; i++) {
      const top = allRules[i];

      for (let j = i + 1; j < allRules.length; j++) {
        const bottom = allRules[j];

        if (
          top.rule.enabled &&
          bottom.rule.enabled &&
          this.hasAnyField(top.rule) &&
          this.hasAnyField(bottom.rule) &&
          this.isTopRuleShadowingBottom(top.rule, bottom.rule)
        ) {
          Toast.show(
            `Conflito: A regra "${bottom.rule.ruleName}" nunca será executada. ` +
              `A regra acima "${top.rule.ruleName}" captura todos os casos dela.`,
            "warning"
          );
        }
      }
    }
  }
  private static isTopRuleShadowingBottom(
    parent: FileRuleSchema,
    child: FileRuleSchema
  ): boolean {
    return (
      this.isFieldMoreGeneric(parent.extension, child.extension) &&
      this.isFieldMoreGeneric(parent.mime, child.mime) &&
      this.isFieldMoreGeneric(parent.url, child.url) &&
      this.isFieldMoreGeneric(parent.finalUrl, child.finalUrl) &&
      this.isFieldMoreGeneric(parent.referrer, child.referrer) &&
      this.isFieldMoreGeneric(parent.fileName, child.fileName)
    );
  }

  private static isFieldMoreGeneric(
    parentVal: string | undefined,
    childVal: string | undefined
  ): boolean {
    if (!parentVal || parentVal === "*") return true;
    if (!childVal || childVal === "*") return false;

    const p = parentVal.toLowerCase().trim();
    const c = childVal.toLowerCase().trim();

    if (p === c) return true;

    if (p.includes("*")) {
      const regex = new RegExp(
        "^" + p.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$",
        "i"
      );
      return regex.test(c);
    }

    return false;
  }

  private static hasAnyField(rule: FileRuleSchema): boolean {
    return Boolean(
      rule.extension ||
        rule.mime ||
        rule.url ||
        rule.finalUrl ||
        rule.referrer ||
        rule.fileName
    );
  }
}
