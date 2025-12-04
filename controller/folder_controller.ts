import { Listener } from "../observer/listener.js";
import { FileSchema } from "../schemas/file_schema.js";
import { OrganizeStrategy } from "./organize_strategy.js";

export class FolderController implements Listener {
  private strategies: OrganizeStrategy[] = [];

  public addStrategy(strategy: OrganizeStrategy): void {
    this.strategies.push(strategy);
  }

  public onNotify(file: chrome.downloads.DownloadItem): chrome.downloads.FilenameSuggestion | void {

    const archive: FileSchema = {
      extension: file.filename?.split('.').pop()?.toLowerCase() || '',
      filename: file.filename || '',
      startDate: new Date(file.startTime)
    };

    for (const strategy of this.strategies) {
      if (strategy.supportsFile(archive)) {
        const newPath = strategy.organize(archive);
        console.log(`Organized file ${file.filename} to ${newPath}`);

        return {
          filename: newPath,
          conflictAction: "uniquify"
        };
      }
    }

    console.log(`No strategy found for file ${file.filename}`);
  }
}
