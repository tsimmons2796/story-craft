import { createAsyncThunk } from "@reduxjs/toolkit";
import { Message } from "../interfaces/message.interface";
import { updateResponse } from "../redux/slice"; // Assuming this is where updateResponse exists

interface GenerateResponseArgs {
  userPrompt: string;
  chatHistory: Message[];
}

export const generateResponse = createAsyncThunk(
  "story/generateResponse",
  async (
    { userPrompt, chatHistory }: GenerateResponseArgs,
    { dispatch, rejectWithValue }
  ) => {
    console.log({ userPrompt, chatHistory });

    try {
      const eventSource = new EventSource(
        `http://localhost:3002/generate?userPromptDescription=${encodeURIComponent(
          userPrompt
        )}&existingChatHistory=${encodeURIComponent(
          JSON.stringify(chatHistory)
        )}`
      );

      return await new Promise<{ response: string }>((resolve, reject) => {
        let response = "";

        eventSource.onmessage = (event) => {
          if (event.data.includes("[COMPLETE]")) {
            eventSource.close();
            resolve({ response }); // Resolve the full response when the stream is complete
          } else if (event.data.includes("[STREAM_ENDED]")) {
            dispatch(updateResponse("[STREAM_ENDED] Continue generating?"));
          } else {
            // Accumulate and dispatch partial responses
            response += event.data;
            dispatch(updateResponse(response));
          }
        };

        eventSource.onerror = (event) => {
          console.error("Stream error:", event);
          eventSource.close();
          reject(
            rejectWithValue("There was an error generating the response.")
          );
        };
      });
    } catch (error) {
      return rejectWithValue("There was an error generating the response.");
    }
  }
);
