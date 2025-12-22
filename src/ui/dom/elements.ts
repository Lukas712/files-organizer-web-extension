export const dom = {
  // Raiz da árvore
  treeRoot: document.getElementById("treeRoot") as HTMLUListElement,

  // Botões da toolbar
  btnNewFolder: document.getElementById("btnNewFolder") as HTMLButtonElement,
  btnNewFile: document.getElementById("btnNewFile") as HTMLButtonElement,
  btnDelete: document.getElementById("btnDelete") as HTMLButtonElement,
  btnSave: document.getElementById("btnSave") as HTMLButtonElement,

  // Seções de formulário
  noSelection: document.getElementById("noSelection") as HTMLDivElement,
  folderForm: document.getElementById("folderForm") as HTMLDivElement,
  fileForm: document.getElementById("fileForm") as HTMLDivElement,

  // Labels com os inputs para pastas
  fldName: document.getElementById("fldName") as HTMLInputElement,
  fldEnabled: document.getElementById("fldEnabled") as HTMLInputElement,
  fldAutoOrg: document.getElementById("fldAutoOrg") as HTMLInputElement,
  fldConflict: document.getElementById("fldConflict") as HTMLSelectElement,

  // Labels com os inputs para arquivos
  fileRuleName: document.getElementById("fileRuleName") as HTMLInputElement,
  fileRuleDescription: document.getElementById(
    "fileRuleDescription"
  ) as HTMLInputElement,
  fileName: document.getElementById("fileName") as HTMLInputElement,
  fileExt: document.getElementById("fileExt") as HTMLInputElement,
  fileMime: document.getElementById("fileMime") as HTMLInputElement,
  fileRef: document.getElementById("fileRef") as HTMLInputElement,
  fileUrl: document.getElementById("fileUrl") as HTMLInputElement,
  fileFinalUrl: document.getElementById("fileFinalUrl") as HTMLInputElement,
  fileDate: document.getElementById("fileDate") as HTMLInputElement,

  btnThemeToggle: document.getElementById(
    "btnToggleTheme"
  ) as HTMLButtonElement,
};
