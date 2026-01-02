import { TreeManager } from "./tree_manager.js";
import { TreeRenderer } from "./tree_renderer.js";
import { Node } from "../../../domain/entities/node.js";
import { dom } from "../../dom/elements.js";
import { DirectoryNode } from "../../../domain/entities/directory.js";
import { FileNode } from "../../../domain/entities/file.js";
import { TreeToRulesSerializer } from "../../tree_to_rules_serialize.js";
import { FolderRuleSchema } from "../../../infrastructure/schemas/folder_schema.js";
import { Toast } from "../../components/toast.js";
import { FileRuleSchema } from "../../../infrastructure/schemas/rule_schema.js";

export class TreeController {
  constructor(private tree: TreeManager, private renderer: TreeRenderer) {}

  init() {
    dom.btnSave.addEventListener("click", () => this.onSave());

    dom.btnThemeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      dom.btnThemeToggle.textContent = document.body.classList.contains("dark")
        ? "☀️"
        : "🌙";
    });
    document.querySelectorAll(".suggest-item").forEach((item) => {
      item.addEventListener("mousedown", (e) => {
        const target = e.currentTarget as HTMLElement;
        const value = target.getAttribute("data-value");
        const input =
          target.parentElement?.parentElement?.querySelector("input");

        if (input && value) {
          input.value = value;
          input.dispatchEvent(new Event("input"));
        }
      });
    });

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

  private async onSave() {
    try {
      this.applyFormChanges();

      const rules = TreeToRulesSerializer.serialize(this.tree.root);

      this.validateNoDuplicateExtensions(rules);

      this.validateRuleShadowing(rules);

      await chrome.storage.local.set({ rules });
      this.renderer.render(this.tree.root, this.tree.selectedNode);
      Toast.show("Configurações salvas!", "success");
    } catch (e: any) {
      Toast.show(e.message, "error");
    }
  }

  private resetForm() {
    dom.noSelection.style.display = "none";
    dom.folderForm.style.display = "none";
    dom.fileForm.style.display = "none";
  }

  private updateForms(node: Node | null) {
    this.resetForm();

    if (!node) {
      dom.noSelection.style.display = "block";
      return;
    }

    if (node instanceof DirectoryNode) {
      this.updateFolderForm(node);
    } else if (node instanceof FileNode) {
      this.updateFileForm(node);
    }
  }

  private updateFolderForm(node: DirectoryNode) {
    dom.folderForm.style.display = "block";

    if ((node as any).isRoot) {
      dom.fldName.disabled = true;
      dom.fldName.value = node.name;
      dom.fldEnabled.disabled = true;
      if (dom.fldFileRules) dom.fldFileRules.disabled = true;
      return;
    } else {
      dom.fldName.disabled = false;
      dom.fldEnabled.disabled = false;
      if (dom.fldFileRules) dom.fldFileRules.disabled = false;
    }

    dom.fldName.value = node.meta.name ?? "";
    dom.fldEnabled.checked = node.enabled ?? true;
    if (dom.fldConflict) dom.fldConflict.value = node.meta.conflictAction ?? "";

    if (dom.fldFileRules) {
      const simpleMeta = {
        conflictAction: node.meta.conflictAction,
        fileRules: node.children
          .filter((child) => child instanceof FileNode)
          .map((child) => (child as FileNode).meta),
      };
      dom.fldFileRules.value = JSON.stringify(simpleMeta, null, 2);
    }
  }

  private updateFileForm(node: FileNode) {
    dom.fileForm.style.display = "block";
    const meta = node.meta;

    dom.fileRuleName.value = meta.ruleName ?? "";

    dom.fileEnabled.checked = meta.enabled ?? true;
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

  private applyFormChanges(): void {
    const node = this.tree.selectedNode;
    if (!node) return;

    if ((node as any).isRoot) return;

    if (node instanceof DirectoryNode) {
      const isEnabled = dom.fldEnabled.checked;
      const newName = dom.fldName.value.trim();

      if (!newName) {
        Toast.show("O nome da pasta é obrigatório.", "warning");
        throw new Error("Nome obrigatório");
      }

      if (dom.fldFileRules) {
        try {
          const rawValue = dom.fldFileRules.value.trim();
          if (rawValue) {
            const updatedData: FolderRuleSchema = JSON.parse(rawValue);

            updatedData.enabled = isEnabled;
            updatedData.name = newName;

            node.name = newName;
            node.enabled = isEnabled;
            node.meta = {
              ...node.meta,
              ...updatedData,
              enabled: isEnabled,
              name: newName,
            };

            if (Array.isArray(updatedData.fileRules)) {
              node.children = node.children.filter(
                (child) => child instanceof DirectoryNode
              );

              updatedData.fileRules.forEach((rule) => {
                const newFile = new FileNode(
                  rule.ruleName || "Nova Regra",
                  rule
                );
                newFile.enabled = rule.enabled ?? true;
                node.addChild(newFile);
              });
            }
          }
        } catch (e) {
          Toast.show(
            "Erro no JSON: A árvore não pôde ser atualizada.",
            "error"
          );
          throw e;
        }
      }

      node.temp = false;
      return;
    }

    if (node instanceof FileNode) {
      const newRuleName = dom.fileRuleName.value.trim();

      if (!newRuleName) {
        Toast.show("O nome da regra é obrigatório.", "warning");
        throw new Error("Nome obrigatório");
      }

      node.meta.ruleName = newRuleName;
      node.name = newRuleName;

      node.meta.enabled = dom.fileEnabled.checked ?? true;
      node.enabled = dom.fileEnabled.checked ?? true;

      node.meta.extension = dom.fileExt.value || undefined;
      node.meta.mime = dom.fileMime.value || undefined;
      node.meta.referrer = dom.fileRef.value || undefined;
      node.meta.url = dom.fileUrl.value || undefined;
      node.meta.finalUrl = dom.fileFinalUrl.value || undefined;
      node.meta.fileName = dom.fileName.value || undefined;
      node.meta.dateTime = dom.fileDate.value
        ? new Date(dom.fileDate.value)
        : undefined;

      node.temp = false;
      return;
    }
  }

  private validateNoDuplicateExtensions(rules: FolderRuleSchema[]): void {
    const seen = new Map<string, string>();

    const walk = (folderList: FolderRuleSchema[]) => {
      for (const folder of folderList) {
        for (const rule of folder.fileRules ?? []) {
          if (!rule.extension) continue;

          const prev = seen.get(rule.extension);
          if (prev && prev !== folder.name) {
            throw new Error(
              `Extensão ".${rule.extension}" já usada na pasta "${prev}".`
            );
          }
          seen.set(rule.extension, folder.name);
        }

        if (folder.folders && folder.folders.length > 0) {
          walk(folder.folders);
        }
      }
    };

    walk(rules);
  }
  private validateRuleShadowing(rules: FolderRuleSchema[]): void {
    const allRules: { folderName: string; rule: FileRuleSchema }[] = [];

    for (const folder of rules) {
      if (folder.fileRules) {
        for (const rule of folder.fileRules) {
          allRules.push({ folderName: folder.name, rule });
        }
      }
    }

    for (let i = 0; i < allRules.length; i++) {
      const topRule = allRules[i];

      for (let j = i + 1; j < allRules.length; j++) {
        const bottomRule = allRules[j];

        if (this.isShadowing(topRule.rule, bottomRule.rule)) {
          Toast.show(
            `Aviso: A regra "${bottomRule.rule.ruleName}" em "${bottomRule.folderName}" ` +
              `nunca será atingida pois a regra "${topRule.rule.ruleName}" em "${topRule.folderName}" é mais genérica.`,
            "warning"
          );
        }
      }
    }
  }

  private isShadowing(parent: FileRuleSchema, child: FileRuleSchema): boolean {
    const isMoreGeneric = (p: string | undefined, c: string | undefined) => {
      if (!p) return true;
      if (p === "*") return true;
      if (p === c) return true;
      if (p.endsWith("/*") && c?.startsWith(p.replace("/*", ""))) return true;
      return false;
    };

    return (
      isMoreGeneric(parent.extension, child.extension) &&
      isMoreGeneric(parent.mime, child.mime)
    );
  }
}
