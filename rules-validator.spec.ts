import { describe, it, expect } from "vitest";
import { RulesValidator } from "./src/ui/rules_validator.js";

describe("RulesValidator", () => {
  it("deve impedir regras duplicadas por extensão", () => {
    const rules = [
      {
        name: "Images",
        fileRules: [{ extension: "png", enabled: true }]
      },
      {
        name: "Pictures",
        fileRules: [{ extension: "png", enabled: true }]
      }
    ];

    expect(() => RulesValidator.validate(rules as any)).toThrow();
  });
});
