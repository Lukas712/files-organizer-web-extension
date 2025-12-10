import { OrganizeStrategy } from "./organize_strategy.js";
import { FileSchema } from "../schemas/file_schema.js";
import { FolderRuleSchema } from "../schemas/folder_schema.js";
import { FileRuleSchema } from "../schemas/rule_schema.js";

export class FolderStrategy implements OrganizeStrategy {
    constructor(private folder: FolderRuleSchema){}

    public supportsFile(file: FileSchema): boolean {
        if (!this.folder.enabled || !this.folder.autoOrganize) return false;

        for(const rule of this.folder.fileRules || []) {
            if (this.matchesRule(file, rule)) {
                return true;
            }
        }
        return false;
    }
    
    public organize(file: FileSchema): string {
        console.log(`Organizing file ${file.filename} into folder ${this.folder.name}`);
        return this.folder.name + "/" + file.filename;
    }

    private matchesRule(file: FileSchema, rule: FileRuleSchema): boolean {
        const matchExtension = rule.extension ? file.extension === rule.extension : true;
        const matchMime = rule.mime ? file.mime === rule.mime : true;
        const matchUrl = rule.url ? file.url.includes(rule.url) : true;
        const matchFinalUrl = rule.finalUrl ? file.finalUrl.includes(rule.finalUrl) : true;
        const matchReferrer = rule.referrer ? file.referrer.includes(rule.referrer) : true;
        return matchExtension && matchMime && matchUrl && matchFinalUrl && matchReferrer;
    }
}