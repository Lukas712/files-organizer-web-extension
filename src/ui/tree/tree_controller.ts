import { TreeManager } from "./tree_manager.js";
import { TreeRenderer } from "./tree_renderer.js";
import { Node } from "../../domain/entities/node.js";
import { dom } from "../dom/elements.js";
import { DirectoryNode } from "../../domain/entities/directory.js";
import { FileNode } from "../../domain/entities/file.js";
import { Toast } from "../components/toast.js";
import { FolderForm } from "../form/folder_form.js";
import { FileForm } from "../form/file_form.js";

export class TreeController {
  constructor(
    private tree: TreeManager,
    private renderer: TreeRenderer,
    private folder_form: FolderForm,
    private file_form: FileForm
  ) {}

  init() {
    this.renderer.render(this.tree.root, null);
  }

  selectNode(node: Node | null): void {
    const prev = this.tree.selectedNode;

    if (prev === node) return;

    if (prev) {
      try {
        this.applyFormChanges();
      } catch (error) {
        console.error("Erro ao aplicar mudanças no nó anterior:", error);
        if (prev.temp) {
          this.tree.delete(prev);
        } else {
        }
      }
    }

    this.tree.selectedNode = node;
    this.updateForms(node);
    this.renderer.render(this.tree.root, node);
  }

  createFolder(): void {
    if (this.tree.hasPendingTempNode()) {
      Toast.show(
        "Finalize a criação atual antes de criar outra regra.",
        "warning"
      );
      return;
    }

    const folder = this.tree.createFolder();
    if (folder.parent instanceof DirectoryNode) {
      folder.parent.expanded = true;
    }
    this.selectNode(folder);
  }

  createFile(): void {
    if (this.tree.hasPendingTempNode()) {
      Toast.show(
        "Finalize a criação atual antes de criar outra regra.",
        "warning"
      );
      return;
    }

    const file = this.tree.createFile();
    if (file.parent instanceof DirectoryNode) {
      file.parent.expanded = true;
    }
    this.selectNode(file);
  }

  deleteSelected(): void {
    const node = this.tree.selectedNode;
    if (!node) return;

    this.tree.delete(node);
    this.tree.selectedNode = null;
    Toast.show("Regra removida (Salve para persistir).", "error");

    this.updateForms(null);
    this.renderer.render(this.tree.root, null);
  }

  private updateForms(node: Node | null) {
    this.folder_form.resetForm();
    this.file_form.resetForm();

    if (!node) {
      dom.noSelection.style.display = "block";
      return;
    }

    if (node instanceof DirectoryNode) {
      this.folder_form.updateForm(node);
    } else if (node instanceof FileNode) {
      this.file_form.updateForm(node);
    }
  }

  private applyFormChanges(): void {
    const node = this.tree.selectedNode;
    if (!node) return;

    if (node instanceof DirectoryNode) {
      this.folder_form.applyForm(node);
    }
    if (node instanceof FileNode) {
      this.file_form.applyForm(node);
    }
    this.renderer.render(this.tree.root, node);
  }

  public getRoot(): DirectoryNode {
    return this.tree.root;
  }

  public commitPendingChanges(): void {
    this.applyFormChanges();
  }

}
