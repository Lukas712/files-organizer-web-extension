import { describe, it, expect } from "vitest";
import { DirectoryNode } from "./src/domain/entities/directory";
import { TreeToRulesSerializer } from "./src/ui/tree_to_rules_serialize";

describe("TreeToRulesSerializer", () => {
  it("deve serializar pastas vazias", () => {
    const root = new DirectoryNode("root");
    const folder = new DirectoryNode("EmptyFolder");

    root.addChild(folder);

    const result = TreeToRulesSerializer.serialize(root);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe("EmptyFolder");
    expect(result[0].fileRules).toEqual([]);
  });
});
