import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { generateResponse } from "./actions";
import { Message } from "../interfaces/message.interface";

interface StoryState {
  isLoading: boolean;
  response: string;
  userPrompt: string;
  formattedUserChoice: string;
  finishReason: string;
  chatHistory: Message[];
  error: string | null;
}

const initialState: StoryState = {
  isLoading: false,
  response: "",
  userPrompt: "",
  formattedUserChoice: `Provide me with 10 random and unique Tones for a story in a numbered list with a title at the top. Be very broad and unique with the suggestions. The title should be 'Story Tones' without any colons or symbols after it.`,
  finishReason: "",
  chatHistory: [
    {
      role: "system",
      content: `You are an assistant that helps users craft high-level concepts and ideas for their stories. Focus on providing foundational concepts in the following areas: Tone, Complexity, Setting, Main Characters, Primary Conflict, Mood, Themes and Motifs, Point of View, and Time Period. Avoid spoilers, climaxes, or in-depth plot specifics. The user will specify the option you have provided by name or the number as you will always provide a numbered list of options for the user to choose from. Or the user can input their own response if none of the provided options are good enough for the user. You will not start until the user says the phrase 'Let's get cracking!' After all of the steps have has a choice been chosen for it, I want you to create a short story based off of all of the answer provided for each step. These answers will serve as the foundation of a story to be created. The story should not be repetitive, and must be a minimum of one thousand words and must be based off of the users choices per step.`,
    },
  ],
  error: null,
};

const storySlice = createSlice({
  name: "story",
  initialState,
  reducers: {
    setResponse: (state, action: PayloadAction<string>) => {
      state.response = action.payload;
    },
    setUserPrompt: (state, action: PayloadAction<string>) => {
      state.userPrompt = action.payload;
    },
    setChatHistory: (state, action: PayloadAction<Message[]>) => {
      state.chatHistory = action.payload;
    },
    setFormattedUserChoice: (state, action: PayloadAction<string>) => {
      state.formattedUserChoice = action.payload;
    },
    addMessageToHistory: (state, action: PayloadAction<Message>) => {
      state.chatHistory.push(action.payload);
    },
    updateResponse(state, action) {
      state.response = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateResponse.pending, (state, action) => {
        state.error = null;
        state.isLoading = true;
      })
      .addCase(generateResponse.fulfilled, (state, action) => {
        console.log({ action });
        const { response } = action.payload;
        state.isLoading = false;
        state.response = response;
        state.chatHistory.push({
          role: "assistant",
          content: response,
        });
        state.error = null;
        state.userPrompt = "";
      })
      .addCase(generateResponse.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setChatHistory,
  setFormattedUserChoice,
  setResponse,
  setUserPrompt,
  updateResponse,
} = storySlice.actions;

export default storySlice;
