import { Node } from "../tree/node.js";
import { DirectoryNode } from "../tree/directory.js";

export class TreeRenderer {
  constructor(
    private container: HTMLUListElement,
    private onSelect: (node: Node) => void
  ) {}

  render(root: DirectoryNode, selected?: Node | null) {
    this.container.innerHTML = "";
    this.renderNode(root, this.container, selected);
  }

  private renderNode(
    node: Node,
    parentEl: HTMLElement,
    selected?: Node | null
  ) {
    const li = document.createElement("li");

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = node.name || "(sem nome)";

    if (selected?.id === node.id) {
      label.classList.add("selected");
    }

    label.addEventListener("click", () => this.onSelect(node));

    li.appendChild(label);
    parentEl.appendChild(li);

    if (node instanceof DirectoryNode && node.expanded) {
      const ul = document.createElement("ul");
      node.children.forEach(child =>
        this.renderNode(child, ul, selected)
      );
      parentEl.appendChild(ul);
    }
  }
}
