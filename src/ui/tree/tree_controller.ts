import { TreeManager } from "./tree_manager.js";
import { TreeRenderer } from "./tree_renderer.js";
import { Node } from "../../domain/entities/node.js";
import { dom } from "../dom/elements.js";
import { DirectoryNode } from "../../domain/entities/directory.js";
import { FileNode } from "../../domain/entities/file.js";
import { TreeToRulesSerializer } from "../tree_to_rules_serialize.js";
import { FolderRuleSchema } from "../../infrastructure/schemas/folder_schema.js";
import { Toast } from "../components/toast.js";

export class TreeController {
  constructor(private tree: TreeManager, private renderer: TreeRenderer) {}

  init() {
    dom.btnSave.addEventListener("click", () => {
      this.onSave();
    });
    dom.btnThemeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

    dom.btnThemeToggle.textContent = document.body.classList.contains("dark")
      ? "☀️"
      : "🌙";
  });
    this.renderer.render(this.tree.root, null);
  }

  private isValidNode(node: Node): boolean {
    if (node instanceof DirectoryNode) {
      return !!node.meta.name?.trim();
    } else if (node instanceof FileNode) {
      return !!node.meta.ruleName?.trim();
    }
    return false;
  }

  private async onSave() {
    try {
      this.applyFormChanges();

      const rules = TreeToRulesSerializer.serialize(this.tree.root);
      this.validateNoDuplicateExtensions(rules);

      await chrome.storage.local.set({ rules });

      Toast.show("Regras salvas com sucesso", "success");
      this.renderer.render(this.tree.root, this.tree.selectedNode);
    } catch (e) {
      const node = this.tree.selectedNode;
      if (node?.temp) {
        this.tree.delete(node);
        this.renderer.render(this.tree.root, null);
      }
    }
  }

  selectNode(node: Node | null): void {
    console.log("Selecionado!");
    const prev = this.tree.selectedNode;

    if (prev === node) return;
    if (prev) {
      try {
        this.applyFormChanges();
      } catch {
        if (prev.temp) {
          this.tree.delete(prev);
        } else {
          return;
        }
      }
    }
    this.tree.selectedNode = node;

    this.updateForms(node);
    this.renderer.render(this.tree.root, node);
  }

  createFolder(): void {
    if (this.tree.hasPendingTempNode()) {
      Toast.show("Finalize a criação atual antes de criar outra regra.");
      return;
    }

    const folder = this.tree.createFolder();
    this.selectNode(folder);
  }

  createFile(): void {
    if (this.tree.hasPendingTempNode()) {
      Toast.show("Finalize a criação atual antes de criar outra regra.");
      return;
    }

    const file = this.tree.createFile();
    this.selectNode(file);
  }
  deleteSelected(): void {
    const node = this.tree.selectedNode;
    if (!node) return;

    this.tree.delete(node);
    this.tree.selectedNode = null;
    Toast.show("Regra deletada.", "error");
    this.updateForms(null);
    this.renderer.render(this.tree.root, null);
  }

  private validateNoDuplicateExtensions(rules: FolderRuleSchema[]): void {
    const seen = new Map<string, string>();

    for (const folder of rules) {
      for (const rule of folder.fileRules ?? []) {
        if (!rule.extension) continue;

        const prev = seen.get(rule.extension);
        if (prev && prev !== folder.name) {
          throw new Error(
            `Extensão ".${rule.extension}" já usada em "${prev}".`
          );
        }

        seen.set(rule.extension, folder.name);
      }
    }
  }

  private resetForm() {
    dom.noSelection.style.display = "none";
    dom.folderForm.style.display = "none";
    dom.fileForm.style.display = "none";
  }

  private updateNoSelection() {
    dom.noSelection.style.display = "block";
  }

  private updateFolderForm(node: DirectoryNode) {
    const meta = node.meta;

    dom.folderForm.style.display = "block";

    dom.fldName.value = meta.name ?? "";
    dom.fldEnabled.checked = meta.enabled ?? true;
    dom.fldAutoOrg.checked = meta.autoOrganize ?? false;
    dom.fldConflict.value = meta.conflictAction ?? "";
  }

  private updateFileForm(node: FileNode) {
    const meta = node.meta;

    dom.fileForm.style.display = "block";

    dom.fileRuleName.value = meta.ruleName ?? "";
    dom.fileRuleDescription.value = meta.ruleDescription ?? "";
    dom.fileExt.value = meta.extension ?? "";
    dom.fileMime.value = meta.mime ?? "";
    dom.fileRef.value = meta.referrer ?? "";
    dom.fileUrl.value = meta.url ?? "";
    dom.fileFinalUrl.value = meta.finalUrl ?? "";
    dom.fileName.value = meta.fileName ?? "";

    dom.fileDate.value = meta.dateTime
      ? new Date(meta.dateTime).toISOString().slice(0, 16)
      : "";
  }

  private updateForms(node: Node | null) {
    this.resetForm();
    if (!node) {
      this.updateNoSelection();
      return;
    } else if (node instanceof DirectoryNode) {
      this.updateFolderForm(node);
      return;
    } else if (node instanceof FileNode) {
      this.updateFileForm(node);
      return;
    }
    dom.noSelection.style.display = "block";
  }

  //TODO Separar a lógica do tipo de nó de forma separada.
  private applyFormChanges(): void {
    const node = this.tree.selectedNode;

    if (!node) return;

    if (node instanceof DirectoryNode) {
      node.meta.name = dom.fldName.value.trim();
      const name = node.meta.name;
      if (!name) {
        Toast.show("O nome da regra é obrigatório.", "warning");
        throw new Error("Nome obrigatório");
      }
      node.name = node.meta.name;

      node.meta.enabled = dom.fldEnabled.checked;
      node.meta.autoOrganize = dom.fldAutoOrg.checked;
      node.meta.conflictAction =
        dom.fldConflict.value === "uniquify" ? "uniquify" : undefined;

      node.temp = false;
      return;
    }

    if (node instanceof FileNode) {
      node.meta.ruleName = dom.fileRuleName.value.trim() || undefined;
      const name = node.meta.ruleName;
      if (!name) {
        Toast.show("O nome da regra é obrigatório.", "warning");
        throw new Error("Nome obrigatório");
      }
      node.meta.ruleDescription =
        dom.fileRuleDescription.value.trim() || undefined;
      node.meta.extension = dom.fileExt.value || undefined;
      node.meta.mime = dom.fileMime.value || undefined;
      node.meta.referrer = dom.fileRef.value || undefined;
      node.meta.url = dom.fileUrl.value || undefined;
      node.meta.finalUrl = dom.fileFinalUrl.value || undefined;
      node.meta.fileName = dom.fileName.value || undefined;
      node.meta.dateTime = dom.fileDate.value
        ? new Date(dom.fileDate.value)
        : undefined;

      node.name = node.meta.ruleName ?? "New Rule";
      node.temp = false;
      return;
    }
  }
}
