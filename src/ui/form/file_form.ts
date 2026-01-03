import { dom } from "../dom/elements.js";
import { FileNode } from "../../domain/entities/file.js";
import { Toast } from "../components/toast.js";
import { FormController } from "./form.js";

export class FileForm extends FormController {
  applyForm(node: FileNode): void {
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
  }

  updateForm(node: FileNode): void {
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
}
