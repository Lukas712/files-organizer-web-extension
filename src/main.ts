import { FolderController } from "./application/controllers/folder_controller.js";
import { Observer } from "./application/observers/observe_folder.js";
import { WebRulesRepository } from "./infrastructure/persistence/web_rules_repository.js";
import { Listener } from "./application/observers/listener.js";

const observer = new Observer();
const repository = new WebRulesRepository();


async function bootstrap(): Promise<Listener[]> {
  await repository.seedIfEmpty();
  const rules = await repository.findAllRules();
  const listeners: Listener[] = [];

  for (const rule of rules) {
    const strategy = repository.ruleToStrategy(rule);
    listeners.push(new FolderController(strategy, rule));
    observer.setListeners(listeners);
  }
  
  console.log("File Organizer iniciado com sucesso!");
  
  return listeners;
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (!changes.rules) return;

  console.log("[Background] regras alteradas, atualizando Observer");

  bootstrap()
    .then(listeners => observer.setListeners(listeners))
    .catch(err => console.error("Erro ao atualizar listeners", err));
  });

  bootstrap();