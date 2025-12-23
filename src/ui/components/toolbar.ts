import { dom } from "../dom/elements.js";
import { TreeController } from "../form/tree/tree_controller.js";

export class Toolbar {
  constructor(private controller: TreeController) {}

  public init() {
    dom.btnNewFolder.addEventListener("click", () => {
      this.controller.createFolder();
    });

    dom.btnNewFile.addEventListener("click", () => {
      this.controller.createFile();
    });

    dom.btnDelete.addEventListener("click", () => {
      this.controller.deleteSelected();
    });
  }
}
