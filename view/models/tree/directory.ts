import { Node } from "./node.js";
import { FolderRuleSchema } from "../../../schemas/folder_schema.js";

export class DirectoryNode extends Node {
  children: Node[] = [];
  meta: FolderRuleSchema = {
    name: "",
    enabled: true,
    autoOrganize: false,
    fileRules: [],
  };
  expanded: boolean = true;

  constructor(name?: string, meta?: Partial<FolderRuleSchema>) {
    super("folder", name);
    if (meta) this.meta = { ...this.meta, ...meta };
  }

  addChild(node: Node) {
    if (node.parent) {
      throw new Error("Node already has a parent");
    }

    if (node === this) {
      throw new Error("Cannot add node to itself");
    }

    node.parent = this;
    this.children.push(node);
  }


  removeChild(node: Node) {
    this.children = this.children.filter(c => c !== node);
  }

  clone(): DirectoryNode {
    const clone = new DirectoryNode(this.name, { ...this.meta });
    clone.id = this.id;
    clone.expanded = this.expanded;
    clone.children = this.children.map(c => {
      const childClone = c.clone();
      if (childClone instanceof Node) childClone.parent = clone;
      return childClone;
    });
    return clone;
  }
}
