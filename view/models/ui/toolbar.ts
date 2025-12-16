import { TreeManager } from "../tree/tree_manager.js";
import { dom } from "../dom/elements.js";

export class Toolbar {
  constructor(private tree: TreeManager, private rerender: () => void) {}

  init() {
    dom.btnNewFolder.addEventListener("click", () => {
      this.tree.createFolder();
      this.rerender();
    });

    dom.btnNewFile.addEventListener("click", () => {
      this.tree.createFile();
      this.rerender();
    });

    dom.btnDelete.addEventListener("click", () => {
      if (this.tree.selectedNode) {
        this.tree.delete(this.tree.selectedNode);
        this.rerender();
      }
    });
  }
}
