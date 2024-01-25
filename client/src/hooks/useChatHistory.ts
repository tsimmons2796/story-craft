import { generateResponse } from "./../redux/actions";
import { Message } from "../interfaces/message.interface";
import { useAppDispatch, useAppSelector } from "../hooks";
import { selectFormattedUserChoice } from "../redux/selectors";
import { setChatHistory } from "../redux/slice";

export const useChatHistory = () => {
  const dispatch = useAppDispatch();
  const formattedUserChoice = useAppSelector(selectFormattedUserChoice);

  const handleGenerateResponse = (
    chatHistoryParam: Message[],
    userChoicePrompt?: string
  ) => {
    console.log(userChoicePrompt);
    if (userChoicePrompt) {
      dispatch(
        setChatHistory([
          ...chatHistoryParam,
          { role: "user", content: userChoicePrompt },
        ])
      );
      dispatch(
        generateResponse({
          userPrompt: userChoicePrompt,
          chatHistory: chatHistoryParam,
        })
      );
    } else {
      dispatch(
        setChatHistory([
          ...chatHistoryParam,
          { role: "user", content: formattedUserChoice },
        ])
      );
      dispatch(
        generateResponse({
          userPrompt: formattedUserChoice,
          chatHistory: chatHistoryParam,
        })
      );
    }
  };

  return {
    handleGenerateResponse,
  };
};
