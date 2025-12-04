import { FolderController } from "./folder_controller.js";
import { Observer } from "../observer/observe_folder.js";
import { ExtensionStrategy } from "./extension_strategy.js";
import { FileSchema } from "../schemas/file_schema.js";

const observer = new Observer();
const controller = new FolderController();
const file: FileSchema = {
    extension: "pdf",
    filename: "teste.pdf",
    startDate: new Date()
};
const folder = { name: "Teste" };
const extensionStrategy = new ExtensionStrategy(file, folder);

observer.addListener(controller);
controller.addStrategy(extensionStrategy);

console.log("File Organizer iniciado com sucesso!");
