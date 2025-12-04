import { FileSchema } from "../schemas/file_schema.js";
import { FolderSchema } from "../schemas/folder_schema.js";

export interface OrganizeStrategy {
    supportsFile(file: FileSchema): boolean;
    organize(file: FileSchema): string;
    getFolder(): FolderSchema;
    getFile(): FileSchema;
}