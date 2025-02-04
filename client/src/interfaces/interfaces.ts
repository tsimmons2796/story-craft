export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AssistantOption {
  [key: number]: string;
}

export interface Step {
  [key: number]: string;
}
