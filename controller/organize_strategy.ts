import { FileSchema } from "../schemas/file_schema.js";

export interface OrganizeStrategy {
    supportsFile(file: FileSchema): boolean;
    organize(file: FileSchema): string;
}