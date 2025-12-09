export * from "./settings";
export * from "./completion.hook";
export * from "./context.type";
export * from "./provider.type";
export * from "./settings.hook";
export * from "./completion";
export * from "./system-prompts";
export * from "./shortcuts";

export interface RouterState {
  initialInput?: string;
  initialFiles?: AttachedFile[];
  agentContext?: {
    name: string;
    prompt: string;
  };
}

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  base64: string;
  size: number;
}
