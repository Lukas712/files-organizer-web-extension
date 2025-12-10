import { Node } from "./node.js";
import { FileRuleSchema } from "../../schemas/rule_schema.js";

export class FileNode extends Node {
  meta: FileRuleSchema = {};

  constructor(name?: string, meta?: FileRuleSchema) {
    super("file", name);
    if (meta) this.meta = meta;
  }

  clone(): FileNode {
    const clone = new FileNode(this.name, { ...this.meta });
    clone.id = this.id;
    return clone;
  }
}
