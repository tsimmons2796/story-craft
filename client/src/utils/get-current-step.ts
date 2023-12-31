import { Message } from "../interfaces/message.interface";
import { Step } from "../interfaces/step.interface";

export const steps: Step = {
  1: "Tone",
  2: "Complexity",
  3: "Setting",
  4: "Main Characters",
  5: "Primary Conflict",
  6: "Mood",
  7: "Themes",
  8: "Motifs",
  9: "Point of View",
  10: "Time Period",
};

export const getCurrentStep = (chatHistory: Message[]): string => {
  const lastAssistantMessage = chatHistory
    .filter((msg) => msg.role === "assistant")
    .pop()?.content;

  if (!lastAssistantMessage || typeof lastAssistantMessage !== "string")
    return "Tone";

  // Find which step the last message corresponds to by checking if the step name appears at the start of the message
  for (const step in steps) {
    if (lastAssistantMessage.startsWith(steps[step])) {
      return steps[step]; // Returning the "current" step name as a string
    }
  }

  return "Tone";
};
