import { AssistantOption } from "../interfaces/output-option.interface";

export const extractAssistantOptions = (
  message: string,
  currentStep: string
): string[] => {
  const options: string[] = [];

  // This regex captures options that might have the format "1. Complexity: Option Value"
  // and also handles cases without the "Complexity: " prefix.
  const optionsRegex = new RegExp(
    `\\d+\\.\\s(?:${currentStep}\\s?:\\s?)?([\\s\\S]+?)(?=\\d+\\.|$)`,
    "g"
  );

  let match;
  console.log({ message, currentStep });

  while ((match = optionsRegex.exec(message)) !== null) {
    options.push(match[1].trim()); // Grab the captured value
  }

  return options;
};

export const getUserChoice = (
  userMessage: string,
  assistantOptions: AssistantOption[]
): string => {
  // Check if the user message is a number
  console.log({ userMessage, assistantOptions });
  if (!isNaN(parseInt(userMessage))) {
    const choiceIndex = parseInt(userMessage) - 1; // Subtract 1 to offset the index
    // Check if the index exists in assistantOptions
    if (choiceIndex >= 0 && choiceIndex < assistantOptions.length) {
      return assistantOptions[choiceIndex].toString();
      // return Object.values(assistantOptions[choiceIndex])[0].toString();
    }
  } else {
    // The user message is not a number, so try to match by name
    for (const option of assistantOptions) {
      const key = parseInt(Object.keys(option)[0]);
      const value = option[key];
      if (userMessage.toLowerCase() === value.toLowerCase()) {
        return value;
      }
    }
  }

  return userMessage; // If no match found, the user has provided their own input
};

export const toCamelCase = (str: string): string => {
  const wordsInString = str.split(" ").length;
  return str
    .split(" ")
    .map((word, index) => {
      if (index === 0 && wordsInString > 1) {
        return word + " ";
      }
      if (index === 0 && wordsInString === 1) {
        return word;
      }
      if (wordsInString === 3 && index === 2) return word + " ";
      return word.trim();
    })
    .join("");
};

export const fromCamelCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Split on capital letters
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatUserChoices = (choices: Record<string, string>): string => {
  return Object.entries(choices)
    .map(([step, choice]) => {
      const formattedStep = /[A-Z]/.test(step) ? fromCamelCase(step) : step;
      return `• ${formattedStep}: ${choice}`;
    })
    .join("\n");
};
