import { DirectoryNode } from "../domain/entities/directory.js";
import { FileNode } from "../domain/entities/file.js";
import { FolderRuleSchema } from "../infrastructure/schemas/folder_schema.js";

// TODO: Mover para camada correta
export class RulesTreeBuilder {
  static buildTree(folders: FolderRuleSchema[]): DirectoryNode {
    const root = new DirectoryNode("Downloads");
    root.meta.name = root.name;

    for (const folderRule of folders) {
      const folderNode = this.buildDirectory(folderRule);
      root.addChild(folderNode);
    }

    return root;
  }

  private static buildDirectory(rule: FolderRuleSchema): DirectoryNode {
    const dir = new DirectoryNode(rule.name, {
      ...rule,
    });

    dir.name = rule.name;
    for (const fileRule of rule.fileRules ?? []) {
      const fileNode = new FileNode(fileRule.ruleName ?? "", { ...fileRule });
      dir.addChild(fileNode);
    }
    for (const subFolder of rule.folders ?? []) {
      const childDir = this.buildDirectory(subFolder);
      dir.addChild(childDir);
    }

    return dir;
  }
}
