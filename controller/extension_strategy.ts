import { OrganizeStrategy } from "../controller/organize_strategy.js";
import { FileSchema } from "../schemas/file_schema.js";
import { FolderSchema } from "../schemas/folder_schema.js";

export class ExtensionStrategy implements OrganizeStrategy {
    constructor(private extension: string, private folder: FolderSchema){}

    public supportsFile(file: FileSchema): boolean {
        console.log(`Checking support for file with extension: ${file.extension}`);
        return file.extension === this.extension;
    }
    
    public organize(file: FileSchema): string {
        console.log(`Organizing file ${file.filename} into folder ${this.folder.name}`);
        return this.folder.name + "/" + file.filename;
    }
}