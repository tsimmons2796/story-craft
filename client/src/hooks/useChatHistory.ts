import { generateResponse } from './../redux/actions';
import { useState } from "react";
import { Message } from "../interfaces/message.interface";
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectChatHistory } from "../redux/selectors";

export const useChatHistory = () => {
  const dispatch = useAppDispatch();
  const chatHistory = useAppSelector(selectChatHistory);

  // This function updates the chat history with the new message
  const handleGenerateResponse = ( userPromptParam: string,
    chatHistoryParam: Message[]) => {
      dispatch(generateResponse({ userPrompt: userPromptParam, chatHistory: chatHistoryParam}));
    }

  // This function makes an API call to generate a response based on the user prompt and chat history

  return {
    chatHistory,
    handleGenerateResponse,
  };
};