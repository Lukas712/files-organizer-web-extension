export interface FileRuleSchema {
    ruleName?: string;
    ruleDescription?: string;
    extension?: string;
    mime?: string;
    referrer?: string;
    url?: string;
    finalUrl?: string;
    fileName?: string;
    dateTime?: Date;
    folderId?: string
}