import { createAsyncThunk } from "@reduxjs/toolkit";
import { Message } from "../interfaces/message.interface";

interface GenerateResponseArgs {
  userPrompt: string;
  chatHistory: Message[];
}

export const generateResponse = createAsyncThunk(
  "story/generateResponse",
  async (
    { userPrompt, chatHistory }: GenerateResponseArgs,
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("http://localhost:3002/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPromptDescription: userPrompt,
          existingChatHistory: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.responseFromApi;
    } catch (error) {
      return rejectWithValue("There was an error generating the response.");
    }
  }
);
