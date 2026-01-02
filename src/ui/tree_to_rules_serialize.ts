import { DirectoryNode } from "../domain/entities/directory.js";
import { FileNode } from "../domain/entities/file.js";
import { FolderRuleSchema } from "../infrastructure/schemas/folder_schema.js";

export class TreeToRulesSerializer {

  static serialize(root: DirectoryNode): FolderRuleSchema[] {
    return root.children
      .filter((c): c is DirectoryNode => c instanceof DirectoryNode)
      .map(folder => this.serializeDirectory(folder));
  }

  private static serializeDirectory(node: DirectoryNode): FolderRuleSchema {
    return {
      name: node.meta.name || node.name,
      enabled: node.meta.enabled ?? node.enabled,
      conflictAction: node.meta.conflictAction,

      fileRules: node.children
        .filter((c): c is FileNode => c instanceof FileNode)
        .map(file => ({
          ...(file as FileNode).meta,
          ruleName: file.name,
          enabled: file.enabled
        })),

      folders: node.children
        .filter((c): c is DirectoryNode => c instanceof DirectoryNode)
        .map(subFolder => this.serializeDirectory(subFolder))
    };
  }
}