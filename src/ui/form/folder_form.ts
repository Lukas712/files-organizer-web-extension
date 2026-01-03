import { dom } from "../dom/elements.js";
import { DirectoryNode } from "../../domain/entities/directory.js";
import { FileNode } from "../../domain/entities/file.js";
import { Toast } from "../components/toast.js";
import { FolderRuleSchema } from "../../infrastructure/schemas/folder_schema.js";
import { FormController } from "./form.js";

export class FolderForm extends FormController {
  applyForm(node: DirectoryNode): void {
    const isEnabled = dom.fldEnabled.checked;
    const newName = dom.fldName.value.trim();

    if (!newName) {
      Toast.show("O nome da pasta é obrigatório.", "warning");
      throw new Error("Nome obrigatório");
    }

    if (dom.fldFileRules) {
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
      }
    }

    node.temp = false;
  }

  updateForm(node: DirectoryNode): void {
    dom.folderForm.style.display = "block";
    dom.fldName.value = node.meta.name ?? "";
    dom.fldEnabled.checked = node.enabled ?? true;
    if (dom.fldConflict) dom.fldConflict.value = node.meta.conflictAction ?? "";

    if (dom.fldFileRules) {
      const fullFolderJson = {
        ...node.meta,
        name: node.name,
        enabled: node.meta.enabled,
        fileRules: node.children
          .filter((child) => child instanceof FileNode)
          .map((child) => (child as FileNode).meta),
        folderRules: node.children
          .filter((child) => child instanceof DirectoryNode)
          .map((child) => (child as DirectoryNode).meta),
      };

      dom.fldFileRules.value = JSON.stringify(fullFolderJson, null, 2);
    }
  }
}
