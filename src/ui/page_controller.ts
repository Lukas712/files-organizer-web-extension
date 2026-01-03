import { TreeManager } from "../ui/tree/tree_manager.js";
import { TreeRenderer } from "../ui/tree/tree_renderer.js";
import { TreeController } from "../ui/tree/tree_controller.js";
import { Toolbar } from "../ui/components/toolbar.js";
import { FolderForm } from "../ui/form/folder_form.js";
import { FileForm } from "../ui/form/file_form.js";
import { dom } from "../ui/dom/elements.js";

import { WebRulesRepository } from "../infrastructure/persistence/web_rules_repository.js";
import { RulesTreeBuilder } from "../ui/rules_tree_builder.js";
import { SaveRulesService } from "./save_rules_service.js";
import { Toast } from "../ui/components/toast.js";

export class PageController {
  private treeController!: TreeController;
  private saveService!: SaveRulesService;

  async init(): Promise<void> {
    try {
      const repository = new WebRulesRepository();
      await repository.seedIfEmpty();

      const folders = await repository.findAllRules();
      const root = RulesTreeBuilder.buildTree(folders);

      const treeManager = new TreeManager(root);
      const renderer = new TreeRenderer(dom.treeRoot, (node) =>
        this.treeController.selectNode(node)
      );

      const folderForm = new FolderForm();
      const fileForm = new FileForm();

      this.treeController = new TreeController(
        treeManager,
        renderer,
        folderForm,
        fileForm
      );

      this.saveService = new SaveRulesService(repository);

      const toolbar = new Toolbar(this.treeController);

      this.bindGlobalEvents();

      this.treeController.init();
      toolbar.init();
    } catch (e: any) {
      Toast.show(e.message ?? "Erro ao inicializar aplicação", "error");
    }
  }

  private bindGlobalEvents(): void {
    dom.btnSave.addEventListener("click", () => this.onSave());
    dom.btnThemeToggle.addEventListener("click", () => this.toggleTheme());

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
  }

  private async onSave(): Promise<void> {
    try {
      this.treeController.commitPendingChanges();

      const root = this.treeController.getRoot();
      await this.saveService.execute(root);

      Toast.show("Configurações salvas com sucesso!", "success");
    } catch (e: any) {
      Toast.show(e.message ?? "Erro ao salvar regras", "error");
    }
  }

  private toggleTheme(): void {
    document.body.classList.toggle("dark");
    dom.btnThemeToggle.textContent = document.body.classList.contains("dark")
      ? "☀️"
      : "🌙";
  }
}
