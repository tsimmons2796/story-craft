import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Message } from "../interfaces/message.interface";

export const useOpenAiStream = (userPrompt: string, chatHistory: Message[]) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3002/generate", {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      const newMessage: Message = JSON.parse(event.data);
      dispatch(addMessageToHistory(newMessage));
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    // Send initial prompt to start the conversation
    fetch("http://localhost:3002/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userPromptDescription: userPrompt,
        existingChatHistory: chatHistory,
      }),
    });

    return () => {
      eventSource.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPrompt, chatHistory]);
};
function addMessageToHistory(newMessage: Message): any {
  throw new Error("Function not implemented.");
}
