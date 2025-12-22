import { Listener } from "../observers/listener.js";
import { FileSchema } from "../../infrastructure/schemas/file_schema.js";
import { FolderRuleSchema } from "../../infrastructure/schemas/folder_schema.js";
import { OrganizeStrategy } from "../../domain/strategies/organize_strategy.js";

export class FolderController implements Listener {


  public constructor(private strategy: OrganizeStrategy, private folder: FolderRuleSchema) {
    this.strategy = strategy;
    this.folder = folder;
  }

  public onNotify(file: chrome.downloads.DownloadItem): chrome.downloads.FilenameSuggestion | void {

    const archive: FileSchema = {
      extension: file.filename?.split('.').pop()?.toLowerCase() || '',
      filename: file.filename || '',
      startDate: new Date(file.startTime),
      mime: file.mime || '',
      url: file.url || '',
      finalUrl: file.finalUrl || '',
      referrer: file.referrer || ''
    };
    const ruleUsed = this.strategy.supportsFile(archive);
    if(ruleUsed) {
      const newPath = this.strategy.organize(archive);
      console.log(`Organized file ${file.filename} to ${newPath} with rule ${ruleUsed.ruleName}`);

      return {
        filename: newPath,
        conflictAction: this.folder.conflictAction
      };
    }

    console.log(`No strategy found for file ${file.filename}`);
  }
}
