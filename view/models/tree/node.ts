import { DirectoryNode } from "./directory.js";

export type NodeType = "file" | "folder";

let uid = () => Math.random().toString(36).slice(2, 9);

export abstract class Node {
  id: string;
  name: string;
  parent: DirectoryNode | null = null;
  type: NodeType;
  temp: boolean = false;

  constructor(type: NodeType, name?: string, id?: string) {
    this.type = type;
    this.name = name || (type === "folder" ? "" : "");
    this.id = id || Math.random().toString(36).slice(2, 9);
  }

  abstract clone(): Node;
}

