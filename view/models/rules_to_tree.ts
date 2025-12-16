import { DirectoryNode } from "./tree/directory.js";
import { FileNode } from "./tree/file.js";

/**
 * Mapper: Persisted rules → Tree (UI)
 */

interface PersistedFolder {
  name: string;
  enabled?: boolean;
  autoOrganize?: boolean;
  conflictAction?: "uniquify";
  children?: PersistedFolder[];
  rules?: PersistedRule[];
}


interface PersistedRule {
  name: string;
  extension?: string;
  mime?: string;
  referrer?: string;
  url?: string;
  finalUrl?: string;
  fileName?: string;
  dateTime?: string;
}

export class RulesToTreeMapper {
  static map(state: PersistedFolder): DirectoryNode {
    const root = new DirectoryNode(state.name || "root");

    root.meta.enabled = state.enabled ?? true;
    root.meta.autoOrganize = state.autoOrganize ?? false;
    if (state.conflictAction === "uniquify") {
        root.meta.conflictAction = "uniquify";
    }


    if (state.children) {
      for (const child of state.children) {
        root.addChild(this.map(child));
      }
    }

    if (state.rules) {
      for (const rule of state.rules) {
        root.addChild(
          new FileNode(rule.name, {
            extension: rule.extension,
            mime: rule.mime,
            referrer: rule.referrer,
            url: rule.url,
            finalUrl: rule.finalUrl,
            fileName: rule.fileName,
            dateTime: rule.dateTime
              ? new Date(rule.dateTime)
              : undefined
          })
        );
      }
    }

    return root;
  }
}
