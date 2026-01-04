import { Node } from "../../domain/entities/node.js";
import { dom } from "../dom/elements.js";
import { FormStrategy } from "../strategies/form_strategy.js";

export abstract class FormController implements FormStrategy {
  abstract applyForm(node: Node): void;
  abstract updateForm(node: Node): void;

  resetForm(): void {
    dom.noSelection.style.display = "none";
    dom.folderForm.style.display = "none";
    dom.fileForm.style.display = "none";
    dom.aboutForm.style.display = "none";
    dom.helpForm.style.display = "none";
  }
}
