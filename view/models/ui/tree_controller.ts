import { TreeManager } from "../tree/tree_manager.js";
import { TreeRenderer } from "./tree_renderer.js";
import { dom } from "../dom/elements.js";
import { Node } from "../tree/node.js";

export class TreeController {
  constructor(
    private tree: TreeManager,
    private renderer: TreeRenderer
  ) {}

  init() {
    this.renderer.render(this.tree.root, null);
  }

  selectNode(node: Node) {
    this.tree.select(node);
    this.renderer.render(this.tree.root, node);
  }
}
