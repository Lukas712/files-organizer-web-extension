import { DirectoryNode } from "../domain/entities/directory.js";
import { FileNode } from "../domain/entities/file.js";
import { FolderRuleSchema } from "../infrastructure/schemas/folder_schema.js";

export class RulesTreeBuilder {

  static buildTree(
    folders: FolderRuleSchema[]
  ): DirectoryNode {

    const root = new DirectoryNode("Downloads")
    root.meta.name = root.name;

    for (const folderRule of folders) {
      const folderNode = new DirectoryNode(folderRule.name, {
        ...folderRule
      });

      folderNode.name = folderRule.name;

      for (const fileRule of folderRule.fileRules ?? []) {
        const fileNode = new FileNode(
          fileRule.ruleName ?? "",
          { ...fileRule }
        );
        folderNode.addChild(fileNode);
      }

      root.addChild(folderNode);
    }

    return root;
  }
}
