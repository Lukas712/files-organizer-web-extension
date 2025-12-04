import { OrganizeStrategy } from "../controller/organize_strategy.js";
import { FileSchema } from "../schemas/file_schema.js";
import { FolderSchema } from "../schemas/folder_schema.js";

export class ExtensionStrategy implements OrganizeStrategy {
    constructor(private file: FileSchema, private folder: FolderSchema){}

    public supportsFile(file: FileSchema): boolean {
        console.log(`Checking support for file with extension: ${file.extension}`);
        return file.extension === this.file.extension;
    }
    
    public organize(file: FileSchema): string {
        console.log(`Organizing file ${file.filename} into folder ${this.folder.name}`);
        return this.folder.name + "/" + file.filename;
    }

    public getFolder(): FolderSchema {
        return this.folder;
    }

    public getFile(): FileSchema {
        return this.file;
    }
}