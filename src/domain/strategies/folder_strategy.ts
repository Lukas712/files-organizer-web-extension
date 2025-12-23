import { OrganizeStrategy } from "./organize_strategy.js";
import { FileSchema } from "../../infrastructure/schemas/file_schema.js";
import { FolderRuleSchema } from "../../infrastructure/schemas/folder_schema.js";
import { FileRuleSchema } from "../../infrastructure/schemas/rule_schema.js";

export class FolderStrategy implements OrganizeStrategy {
  constructor(private folder: FolderRuleSchema) {}

  public supportsFile(file: FileSchema): FileRuleSchema | null {
    if (!this.folder.enabled) return null;

    for (const rule of this.folder.fileRules || []) {
      if (this.matchesRule(file, rule)) {
        return rule;
      }
    }
    return null;
  }

  public organize(file: FileSchema): string {
    console.log(
      `Organizing file ${file.filename} into folder ${this.folder.name}`
    );
    return this.folder.name + "/" + file.filename;
  }

  private matchesRule(file: FileSchema, rule: FileRuleSchema): boolean {
    const checkMatch = (
      pattern: string | undefined,
      value: string
    ): boolean => {
      if (!pattern) return true;
      const regexPattern = pattern
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*");
      const regex = new RegExp(`^${regexPattern}$`, "i");
      return regex.test(value);
    };

    const matchExtension = checkMatch(rule.extension, file.extension);
    const matchMime = checkMatch(rule.mime, file.mime);

    const matchUrl = rule.url ? file.url.includes(rule.url) : true;
    const matchFinalUrl = rule.finalUrl
      ? file.finalUrl.includes(rule.finalUrl)
      : true;
    const matchReferrer = rule.referrer
      ? file.referrer.includes(rule.referrer)
      : true;

    return (
      matchExtension && matchMime && matchUrl && matchFinalUrl && matchReferrer
    );
  }
}
