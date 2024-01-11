import { useState } from "react";
import { Message } from "../interfaces/message.interface";

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      role: "system",
      content: `You are an assistant that helps users craft high-level concepts and ideas for their stories. Focus on providing foundational concepts in the following areas: Tone and Complexity, Setting, Main Characters, Primary Conflict, Mood, Themes and Motifs, Point of View, and Time Period. Avoid spoilers, climaxes, or in-depth plot specifics. The user will specify the option you have provided by name or the number as you will always provide a numbered list of options for the user to choose from. Or the user can input their own response if none of the provided options are good enough for the user. You will not start until the user says the phrase 'Let's get crackin!' After all of the steps have has a choice been chosen for it, I want you to create a short story based off of all of the answer provided for each step. These answers will serve as the foundation of a story to be created. The story should not be reptitive, and must be a minimum of one thousand words and must be based off of the users choices per step.`,
    },
  ]);

  // This function updates the chat history with the new message
  const updateChatHistory = (message: Message) => {
    setChatHistory((prevChatHistory) => [...prevChatHistory, message]);
  };

  // This function makes an API call to generate a response based on the user prompt and chat history
  const generateResponse = async (
    userPromptParam: string,
    chatHistoryParam: Message[]
  ): Promise<string> => {
    try {
      const response = await fetch("http://localhost:3002/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPromptDescription: userPromptParam,
          existingChatHistory: chatHistoryParam,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newMessage: Message = {
        role: "assistant",
        content: data.responseFromApi,
      };
      updateChatHistory(newMessage);
      return data.responseFromApi;
    } catch (error) {
      console.error("Failed to fetch the generate response: ", error);
      return "There was an error generating the response.";
    }
  };

  return {
    chatHistory,
    setChatHistory,
    generateResponse,
  };
};