import { TreeManager } from "./tree_manager.js";
import { DirectoryNode } from "./directory.js";
import { FileNode } from "./file.js";
import { Node } from "./node.js";

// --- Seletores DOM ---
const treeRoot = document.getElementById("treeRoot") as HTMLUListElement;

const btnNewFolder = document.getElementById(
  "btnNewFolder"
) as HTMLButtonElement;
const btnNewFile = document.getElementById("btnNewFile") as HTMLButtonElement;
const btnDelete = document.getElementById("btnDelete") as HTMLButtonElement;
const btnSave = document.getElementById("btnSave") as HTMLButtonElement;

// Forms
const noSelection = document.getElementById("noSelection") as HTMLDivElement;
const folderForm = document.getElementById("folderForm") as HTMLDivElement;
const fileForm = document.getElementById("fileForm") as HTMLDivElement;

// Inputs
const fldName = document.getElementById("fldName") as HTMLInputElement;
const fldEnabled = document.getElementById("fldEnabled") as HTMLInputElement;
const fldAutoOrg = document.getElementById("fldAutoOrg") as HTMLInputElement;
const fldConflict = document.getElementById("fldConflict") as HTMLSelectElement;
const fldFileRules = document.getElementById(
  "fldFileRules"
) as HTMLTextAreaElement;

const fileExt = document.getElementById("fileExt") as HTMLInputElement;
const fileMime = document.getElementById("fileMime") as HTMLInputElement;
const fileRef = document.getElementById("fileRef") as HTMLInputElement;
const fileUrl = document.getElementById("fileUrl") as HTMLInputElement;
const fileFinalUrl = document.getElementById(
  "fileFinalUrl"
) as HTMLInputElement;
const fileName = document.getElementById("fileName") as HTMLInputElement;
const fileDate = document.getElementById("fileDate") as HTMLInputElement;

// --- Instancia TreeManager ---
const tree = new TreeManager(new DirectoryNode("root"));

// --- Funções de renderização ---
function render() {
  treeRoot.innerHTML = "";
  renderNode(tree.root, treeRoot);
}

function renderNode(node: Node, container: HTMLElement) {
  const li = document.createElement("li");
  li.dataset.id = node.id;

  const disclosure = document.createElement("span");
  disclosure.className = "disclosure";
  disclosure.innerText =
    node instanceof DirectoryNode ? (node.expanded ? "▾" : "▸") : "";
  li.appendChild(disclosure);

  const label = document.createElement("div");
  label.className = "label";
  label.innerHTML = `<span class="icon">${
    node instanceof DirectoryNode ? "📁" : "📄"
  }</span>
                     <span class="name">${node.name}</span>`;

  if (tree.selectedNode && tree.selectedNode.id === node.id) {
    label.classList.add("selected");
  } else {
    label.classList.remove("selected");
  }

  li.appendChild(label);

  disclosure.addEventListener("click", (e) => {
    e.stopPropagation();
    if (node instanceof DirectoryNode) {
      node.expanded = !node.expanded;
      render();
    }
  });

  label.addEventListener("click", (e) => {
    e.stopPropagation();

    if (tree.selectedNode?.temp) {
      tree.deleteNode(tree.selectedNode);
      tree.selectedNode = null;
    }

    tree.selectNode(node);
    render();
    populateForm(node);
  });

  container.appendChild(li);

  if (node instanceof DirectoryNode && node.expanded) {
    const ul = document.createElement("ul");
    ul.className = "node-children";
    node.children.forEach((child) => renderNode(child, ul));
    container.appendChild(ul);
  }
}

// --- Função para popular formulário ---
function populateForm(node: Node) {
  noSelection.style.display = "none";
  if (node instanceof DirectoryNode) {
    folderForm.style.display = "";
    fileForm.style.display = "none";
    fldName.value = node.name;
    fldEnabled.checked = node.meta.enabled;
    fldAutoOrg.checked = node.meta.autoOrganize;
    fldConflict.value = node.meta.conflictAction || "";
    fldFileRules.value = JSON.stringify(node.meta.fileRules || [], null, 2);
  } else if (node instanceof FileNode) {
    folderForm.style.display = "none";
    fileForm.style.display = "";
    fileExt.value = node.meta.extension || "";
    fileMime.value = node.meta.mime || "";
    fileRef.value = node.meta.referrer || "";
    fileUrl.value = node.meta.url || "";
    fileFinalUrl.value = node.meta.finalUrl || "";
    fileName.value = node.name || node.meta.fileName || "";
    fileDate.value = node.meta.dateTime
      ? new Date(node.meta.dateTime).toISOString().slice(0, 16)
      : "";
  }
}

function hasTempNode(): boolean {
  let found = false;
  function check(node: Node) {
    if (node.temp) {
      found = true;
      return;
    }
    if (node instanceof DirectoryNode) node.children.forEach(check);
  }
  check(tree.root);
  return found;
}

// --- Funções CRUD via TreeManager ---
btnNewFile.addEventListener("click", () => {
  if (hasTempNode()) return;
  const newFile = tree.createTempFile(
    tree.selectedNode instanceof DirectoryNode ? tree.selectedNode : undefined
  );
  tree.selectNode(newFile);
  render();
  populateForm(newFile);
  fileName.focus();
});

btnNewFolder.addEventListener("click", () => {
  if (hasTempNode()) return;
  const newFolder = tree.createTempFolder(
    tree.selectedNode instanceof DirectoryNode ? tree.selectedNode : undefined
  );
  tree.selectNode(newFolder);
  render();
  populateForm(newFolder);
  fldName.focus();
});

btnDelete.addEventListener("click", () => {
  if (tree.selectedNode) {
    tree.deleteNode(tree.selectedNode);
    tree.selectedNode = null;
    showNoSelection();
    render();
  }
});

btnSave.addEventListener("click", () => {
  if (!tree.selectedNode) return;

  const name =
    tree.selectedNode instanceof FileNode
      ? fileName.value.trim()
      : fldName.value.trim();
  if (!name) {
    alert("Informe um nome antes de salvar.");
    return;
  }

  tree.selectedNode.temp = false;

  if (tree.selectedNode instanceof DirectoryNode) {
    tree.saveNode(tree.selectedNode, {
      name: name,
      meta: {
        ...tree.selectedNode.meta,
        enabled: fldEnabled.checked,
        autoOrganize: fldAutoOrg.checked,
        conflictAction: fldConflict.value || undefined,
        fileRules: JSON.parse(fldFileRules.value || "[]"),
      },
    });
  } else if (tree.selectedNode instanceof FileNode) {
    tree.saveNode(tree.selectedNode, {
      name: name,
      meta: {
        ...tree.selectedNode.meta,
        extension: fileExt.value || undefined,
        mime: fileMime.value || undefined,
        referrer: fileRef.value || undefined,
        url: fileUrl.value || undefined,
        finalUrl: fileFinalUrl.value || undefined,
        fileName: name,
        dateTime: fileDate.value ? new Date(fileDate.value) : undefined,
      },
    });
  }

  render();
});

// --- Helpers ---
function showNoSelection() {
  noSelection.style.display = "";
  folderForm.style.display = "none";
  fileForm.style.display = "none";
}

// --- Inicialização ---
render();
showNoSelection();
