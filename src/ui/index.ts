import { TreeManager } from "./tree/tree_manager.js";
import { TreeRenderer } from "./tree/tree_renderer.js";
import { TreeController } from "./tree/tree_controller.js";
import { Toolbar } from "./components/toolbar.js";
import { dom } from "./dom/elements.js";
import { WebRulesRepository } from "../infrastructure/persistence/web_rules_repository.js";
import { RulesTreeBuilder } from "./rules_tree_builder.js";

const repo = new WebRulesRepository();

await repo.seedIfEmpty();
const folders = await repo.findAllRules();

const root = RulesTreeBuilder.buildTree(folders);

const tree = new TreeManager(root);

const renderer = new TreeRenderer(dom.treeRoot, (node) =>
  controller.selectNode(node)
);

const controller = new TreeController(tree, renderer);
const toolbar = new Toolbar(controller);

controller.init();
toolbar.init();
