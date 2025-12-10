import { FolderController } from "./folder_controller.js";
import { Observer } from "../observer/observe_folder.js";
import { WebRulesRepository } from "../repository/web_rules_repository.js";

async function bootstrap() {
  const observer = new Observer();
  const repository = new WebRulesRepository();

  await repository.seedIfEmpty();

  const rules = await repository.findAllRules();

  for (const rule of rules) {
    const strategy = repository.ruleToStrategy(rule);
    let controller = new FolderController(strategy, rule);
    observer.addListener(controller);
  }

  console.log("File Organizer iniciado com sucesso!");
}

bootstrap();