import { Node } from "../../domain/entities/node";
import { dom } from "../dom/elements";

export interface FormStrategy {
  applyForm(node: Node): void;
  updateForm(node: Node): void;
  resetForm(): void;
}
