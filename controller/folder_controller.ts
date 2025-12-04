import { Listener } from "../observer/listener";
import { FileSchema } from "../schemas/file_schema";
import { FolderSchema } from "../schemas/folder_schema";
import { OrganizeStrategy } from "./organize_strategy";

export class FolderController implements Listener {
    private strategies: OrganizeStrategy[] = [];

    public addStrategy(strategy: OrganizeStrategy): void {
        this.strategies.push(strategy);
    }
    
    public onNotify(file: chrome.downloads.DownloadItem): chrome.downloads.FilenameSuggestion | void {
        for (const strategy of this.strategies) {
            const archive: FileSchema = {
                extension: file.filename?.split('.').pop() || '',
                filename: file.filename || '',
                startDate: new Date(file.startTime)
            }
            if (strategy.supportsFile(archive)) {
                const newPath = strategy.organize(archive);
                console.log(`Organized file ${file.filename} to ${newPath}`);
                return {
                    filename: newPath,
                    conflictAction: "uniquify"
                };
            }
            console.log(`Strategy does not support file ${file.filename}`);
        }
    }
}