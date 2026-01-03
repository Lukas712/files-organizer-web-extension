import { DirectoryNode } from "../domain/entities/directory.js";
import { FileNode } from "../domain/entities/file.js";
import { FolderRuleSchema } from "../infrastructure/schemas/folder_schema.js";

// TODO: Mover para camada correta
export class TreeToRulesSerializer {

  static serialize(root: DirectoryNode): FolderRuleSchema[] {
    return root.children
      .filter(c => c instanceof DirectoryNode)
      .map(c => this.serializeDirectory(c as DirectoryNode));
  }

  private static serializeDirectory(dir: DirectoryNode): FolderRuleSchema {
    return {
      name: dir.name,
      enabled: dir.meta.enabled,
      conflictAction: dir.meta.conflictAction,

      fileRules: dir.children
        .filter(c => c instanceof FileNode)
        .map(c => ({ ...(c as FileNode).meta })),

      folders: dir.children
        .filter(c => c instanceof DirectoryNode)
        .map(c => this.serializeDirectory(c as DirectoryNode)),
    };
  }
}
