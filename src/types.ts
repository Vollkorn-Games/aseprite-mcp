export interface AsepriteServerConfig {
  asepritePath?: string;
  debugMode?: boolean;
  toolsets?: string[];
  excludeTools?: string[];
  readOnly?: boolean;
}

export type OperationParams = Record<string, any>;

export interface ToolResponse {
  content: { type: string; text: string }[];
  isError?: boolean;
}
