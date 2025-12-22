import { DirectoryNode } from "../domain/entities/directory.js";
import { FileNode } from "../domain/entities/file.js";
import { FolderRuleSchema } from "../infrastructure/schemas/folder_schema.js";

export class TreeToRulesSerializer {

  static serialize(root: DirectoryNode): FolderRuleSchema[] {
    return root.children
      .filter(c => c instanceof DirectoryNode)
      .map(folder => {
        const dir = folder as DirectoryNode;

        return {
          name: dir.meta.name,
          enabled: dir.meta.enabled,
          autoOrganize: dir.meta.autoOrganize,
          conflictAction: dir.meta.conflictAction,
          fileRules: dir.children
            .filter(c => c instanceof FileNode)
            .map(file => ({ ...(file as FileNode).meta }))
        };
      });
  }
}
