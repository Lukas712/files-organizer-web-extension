import { TreeManager } from "./tree/tree_manager.js";
import { DirectoryNode } from "./tree/directory.js";
import { TreeRenderer } from "./ui/tree_renderer.js";
import { TreeController } from "./ui/tree_controller.js";
import { Toolbar } from "./ui/toolbar.js";
import { dom } from "./dom/elements.js";

const tree = new TreeManager(new DirectoryNode("root"));

const renderer = new TreeRenderer(dom.treeRoot, node =>
  controller.selectNode(node)
);

const controller = new TreeController(tree, renderer);
const toolbar = new Toolbar(tree, () =>
  renderer.render(tree.root, tree.selectedNode)
);

controller.init();
toolbar.init();