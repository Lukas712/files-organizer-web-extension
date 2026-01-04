import { RulesRepository } from "../../domain/contracts/rules_repository.js";
import { DirectoryNode } from "../../domain/entities/directory.js";
import { RulesValidator } from "./rules_validator.js";
import { TreeToRulesSerializer } from "./tree_to_rules_serialize.js";

export class SaveRulesService {
  constructor(
    private repository: RulesRepository
  ) {}

  async execute(root: DirectoryNode): Promise<void> {
    const rules = TreeToRulesSerializer.serialize(root);
    RulesValidator.validate(rules);
    await this.repository.saveRules(rules);
  }
}