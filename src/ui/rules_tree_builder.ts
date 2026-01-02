import { DirectoryNode } from "../domain/entities/directory.js";
import { FileNode } from "../domain/entities/file.js";
import { FolderRuleSchema } from "../infrastructure/schemas/folder_schema.js";

export class RulesTreeBuilder {
  static buildTree(folders: FolderRuleSchema[]): DirectoryNode {
    const root = new DirectoryNode("Downloads");
    root.meta.name = root.name;

    for (const folderRule of folders) {
      const node = this.buildRecursive(folderRule);
      root.addChild(node);
    }

    return root;
  }
  private static buildRecursive(rule: FolderRuleSchema): DirectoryNode {
    const directoryNode = new DirectoryNode(rule.name, { ...rule });

    if (rule.fileRules) {
      for (const fileRule of rule.fileRules) {
        const fileNode = new FileNode(fileRule.ruleName ?? "", { ...fileRule });
        directoryNode.addChild(fileNode);
      }
    }
    const subFolders = (rule as any).folders || (rule as any).children || [];

    for (const subFolderRule of subFolders) {
      const childNode = this.buildRecursive(subFolderRule);
      directoryNode.addChild(childNode);
    }

    return directoryNode;
  }
}
