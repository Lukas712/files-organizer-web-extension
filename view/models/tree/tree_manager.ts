import { DirectoryNode } from "./directory.js";
import { FileNode } from "./file.js";
import { Node } from "./node.js";

export class TreeManager {
  readonly root: DirectoryNode;
  selectedNode: Node | null = null;

  constructor(root?: DirectoryNode) {
    this.root = root ?? new DirectoryNode("root");
  }

  select(node: Node | null) {
    this.selectedNode = node;
  }

  createFolder(parent?: DirectoryNode): DirectoryNode {
    const base = parent ?? this.getCurrentDirectory();
    const folder = new DirectoryNode();
    base.addChild(folder);
    return folder;
  }

  createFile(parent?: DirectoryNode): FileNode {
    const base = parent ?? this.getCurrentDirectory();
    const file = new FileNode();
    base.addChild(file);
    return file;
  }

  delete(node: Node) {
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
}
