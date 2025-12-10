import { DirectoryNode } from "./directory.js";
import { FileNode } from "./file.js";
import { Node } from "./node.js";

export class TreeManager {
  root: DirectoryNode;
  selectedNode: Node | null = null;

  constructor(root?: DirectoryNode) {
    this.root = root || new DirectoryNode("root");
  }

  selectNode(node: Node) {
    this.selectedNode = node;
  }

  createFolder(parent?: DirectoryNode, select = true): DirectoryNode {
    const base = parent || (this.selectedNode instanceof DirectoryNode ? this.selectedNode : this.root);
    const folder = new DirectoryNode();
    base.addChild(folder);
    if (select) this.selectNode(folder);
    return folder;
  }

  createFile(parent?: DirectoryNode, select = true): FileNode {
    const base = parent || (this.selectedNode instanceof DirectoryNode ? this.selectedNode : this.root);
    const file = new FileNode();
    base.addChild(file);
    if (select) this.selectNode(file);
    return file;
  }

  deleteNode(node: Node) {
    if (!node.parent) return;
    node.parent.removeChild(node);
    if (this.selectedNode === node) this.selectedNode = null;
  }

  saveNode(node: Node, data: Partial<Node & { meta?: any }>) {
    node.name = data.name || node.name;
    if ("meta" in data && data.meta) {
      (node as any).meta = data.meta;
    }
  }

  createTempFile(parent?: DirectoryNode): FileNode {
    const base = parent || (this.selectedNode instanceof DirectoryNode ? this.selectedNode : this.root);
    const file = new FileNode("");
    file.temp = true; // marca como temporário
    base.addChild(file);
    return file;
  }

  createTempFolder(parent?: DirectoryNode): DirectoryNode {
    const base = parent || (this.selectedNode instanceof DirectoryNode ? this.selectedNode : this.root);
    const folder = new DirectoryNode("");
    folder.temp = true;
    base.addChild(folder);
    return folder;
  }



  cloneTree() {
    return this.root.clone();
  }
}
