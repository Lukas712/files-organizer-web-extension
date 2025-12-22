import { Node } from "../../domain/entities/node.js";
import { DirectoryNode } from "../../domain/entities/directory.js";

export class TreeRenderer {
  private root!: DirectoryNode;

  constructor(
    private container: HTMLUListElement,
    private onSelect: (node: Node) => void
  ) {}

  render(root: DirectoryNode, selected?: Node | null) {
    this.root = root;
    this.container.innerHTML = "";
    this.renderNode(root, this.container, selected);
  }

  private renderNode(
    node: Node,
    parentEl: HTMLElement,
    selected?: Node | null
  ) {
    const li = document.createElement("li");
    li.classList.add("tree-node");

    const label = document.createElement("div");
    label.className = "label";

    if (node instanceof DirectoryNode) {
      const disclosure = document.createElement("span");
      disclosure.className = "disclosure";
      disclosure.textContent = node.expanded ? "▼" : "▶";

      disclosure.addEventListener("click", (e) => {
        e.stopPropagation();
        node.expanded = !node.expanded;
        this.render(this.root, selected);
      });

      label.appendChild(disclosure);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "disclosure spacer";
      label.appendChild(spacer);
    }

    const text = document.createElement("span");
    text.className = "node-text";
    text.textContent = node.name || "(sem nome)";
    label.appendChild(text);

    if (selected?.id === node.id) {
      label.classList.add("selected");
    }

    label.addEventListener("click", () => this.onSelect(node));

    li.appendChild(label);
    parentEl.appendChild(li);

    if (node instanceof DirectoryNode && node.expanded) {
      const ul = document.createElement("ul");
      ul.className = "node-children expanded";

      node.children.forEach((child) => this.renderNode(child, ul, selected));

      parentEl.appendChild(ul);
    }
  }
}
