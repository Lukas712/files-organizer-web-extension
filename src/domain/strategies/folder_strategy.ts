import { OrganizeStrategy } from "./organize_strategy.js";
import { FileSchema } from "../../infrastructure/schemas/file_schema.js";
import { FolderRuleSchema } from "../../infrastructure/schemas/folder_schema.js";
import { FileRuleSchema } from "../../infrastructure/schemas/rule_schema.js";

export class FolderStrategy implements OrganizeStrategy {
  constructor(private folder: FolderRuleSchema) {}

  public supportsFile(file: FileSchema): FileRuleSchema | null {
    if (!this.folder.enabled) return null;

    for (const rule of this.folder.fileRules || []) {
      if (rule.enabled === false) continue;
      
      if (!this.hasAnyField(rule)) continue;

      if (this.matchesRule(file, rule)) {
        return rule;
      }
    }
    return null;
  }

  public organize(file: FileSchema): string {
    return this.folder.name + "/" + file.filename;
  }

  private matchesRule(file: FileSchema, rule: FileRuleSchema): boolean {
    const normalizeExt = (txt?: string) => {
      if (!txt) return "";
      const lower = txt.toLowerCase().trim();
      return lower.startsWith(".") ? lower : "." + lower;
    };

    const normalizeMime = (txt?: string) => {
      if (!txt) return "";
      return txt.split(";")[0].toLowerCase().trim();
    };

    const checkMatch = (ruleValue: string | undefined, fileValue: string, isExtension = false): boolean => {
      if (!ruleValue) return true;
      if (!fileValue) return false;

      let p = isExtension ? normalizeExt(ruleValue) : ruleValue.toLowerCase().trim();
      let v = isExtension ? normalizeExt(fileValue) : fileValue.toLowerCase().trim();

      if (isExtension === false && ruleValue.includes("/")) {
         v = normalizeMime(fileValue); 
      }

      if (p === "*") return true;
      if (p === v) return true;

      if (p.includes("*")) {
        const regexStr = "^" + p.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$";
        return new RegExp(regexStr, "i").test(v);
      }

      return false;
    };

    const matchExtension = checkMatch(rule.extension, file.extension, true);
    const matchMime = checkMatch(rule.mime, file.mime, false);
    
    const matchUrl = checkMatch(rule.url, file.url);
    const matchFinalUrl = checkMatch(rule.finalUrl, file.finalUrl);
    const matchReferrer = checkMatch(rule.referrer, file.referrer);
    const matchFileName = rule.fileName 
        ? (file.filename || "").toLowerCase().includes(rule.fileName.toLowerCase()) 
        : true;

    return (
      matchExtension &&
      matchMime &&
      matchUrl &&
      matchFinalUrl &&
      matchReferrer &&
      matchFileName
    );
  }

  private hasAnyField(rule: FileRuleSchema): boolean {
    return Boolean(
      rule.extension || rule.mime || rule.url || rule.finalUrl || rule.referrer || rule.fileName
    );
  }
}