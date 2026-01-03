import { DirectoryNode } from "../../../domain/entities/directory.js";
import { FileNode } from "../../../domain/entities/file.js";
import { Node } from "../../../domain/entities/node.js";

export class TreeManager {
  readonly root: DirectoryNode;
  selectedNode: Node | null = null;

  constructor(root?: DirectoryNode) {
    this.root = root ?? new DirectoryNode("Downloads");
  }

  createFolder(parent?: DirectoryNode): DirectoryNode {
    const base = parent ?? this.getCurrentDirectory();
    const folder = new DirectoryNode();
    folder.temp = true;
    base.addChild(folder);
    return folder;
  }

  createFile(parent?: DirectoryNode): FileNode {
    const base = parent ?? this.getCurrentDirectory();
    const file = new FileNode();
    file.temp = true;
    base.addChild(file);
    return file;
  }

  delete(node: Node): void {
    if (!node.parent) return;
    node.parent.removeChild(node);

    if (this.selectedNode === node) {
      this.selectedNode = null;
    }
  }

  getCurrentDirectory(): DirectoryNode {
    if (this.selectedNode instanceof DirectoryNode) {
      return this.selectedNode;
    }

    if (this.selectedNode?.parent) {
      return this.selectedNode.parent;
    }

    return this.root;
  }

  hasPendingTempNode(): boolean {
    const walk = (dir: DirectoryNode): boolean => {
      if (dir.temp) return true;

      for (const child of dir.children) {
        if (child.temp) return true;
        if (child instanceof DirectoryNode && walk(child)) return true;
      }
      return false;
    };

    return walk(this.root);
  }
}
