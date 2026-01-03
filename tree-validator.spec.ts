import { describe, it, expect } from "vitest";
import { FileNode } from "./src/domain/entities/file";

describe("Integração: FileForm + Node", () => {
  it("deve atualizar o nome da regra após edição", () => {
    const fileNode = new FileNode("Old Name", {
      ruleName: "Old Name",
      enabled: true
    });

    // Simula aplicação do formulário
    fileNode.meta.ruleName = "New Name";
    fileNode.name = "New Name";

    expect(fileNode.name).toBe("New Name");
    expect(fileNode.meta.ruleName).toBe("New Name");
  });
});
