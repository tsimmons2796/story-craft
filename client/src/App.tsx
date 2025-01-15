import ReactMarkdown from "react-markdown";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { getCurrentStep, steps } from "./utils/get-current-step";
import {
  extractAssistantOptions,
  formatUserChoices,
  getUserChoice,
} from "./utils/options-and-choices";
import { useChatHistory } from "./hooks/useChatHistory";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  selectChatHistory,
  selectFinishReason,
  // selectFormattedUserChoice,
  selectIsLoading,
  selectResponse,
} from "./redux/selectors";
import { setFormattedUserChoice, setUserPrompt } from "./redux/slice";
// import { useOpenAiStream } from "./api/useOpenAiStream";

//  Example:{
// Tone: "Suspenseful",
// Complexity: "Psychological manipulation and mind games",
// Setting: "Isolated mountain village",
// mainCharacters:
//   "Emily, a young artist who seeks solace in the mountains after a tragic loss and discovers an ancient secret.",
// primaryConflict:
//   "The Memory Thief: Emily discovers a magical artifact that allows her to enter other people's memories. However, she soon realizes that someone is using this power nefariously, erasing memories and manipulating lives. Emily must unravel the mystery and put a stop to the memory thief before all of her loved ones lose their identities.",
// Mood: "Gritty and Intense - The memory thief's manipulations create a gritty and intense atmosphere. Emily must confront dark truths and face dangerous challenges, leading to a raw and emotionally charged mood throughout the story.",
// Themes:
//   "Themes of Memory and Identity: Examine the connection between memory and personal identity, as well as the implications of altering or erasing memories. Raise questions about the nature of identity and how memories shape who we are.",
// Motifs:
//   "Dreams and Visions: Explore the recurring motifs of dreams and visions as characters grapple with memories and their impact on their present reality. These surreal experiences serve as a visual representation of the blurred boundaries between memory and identity.",
// pointOfView:
//   "Emily's First-Person Perspective: Experience the story through Emily's eyes as she navigates the dreams and visions that unlock memories and chart her journey of self-discovery.",
// timePeriod: "Ancient Mythological Era",
//   }

export default function App() {
  const isLoading = useAppSelector(selectIsLoading);
  const response = useAppSelector(selectResponse);
  const finishReason = useAppSelector(selectFinishReason);
  const chatHistory = useAppSelector(selectChatHistory);
  // const formattedUserChoice = useAppSelector(selectFormattedUserChoice);
  const dispatch = useAppDispatch();
  const [userChoicesPerStep, setUserChoicesPerStep] =
    useState<Record<string, string>>();
  const { handleGenerateResponse } = useChatHistory();
  const [userInput, setUserInput] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<string>(() =>
    getCurrentStep(chatHistory)
  );
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const startApplication = async () => {
    handleGenerateResponse(chatHistory);
    setHasStarted(true);
  };

  // console.log({ finishReason });

  const onSubmit = async (submitEvent: FormEvent) => {
    submitEvent.preventDefault();

    // Extract assistant options
    const assistantOptions = extractAssistantOptions(
      response,
      getCurrentStep(chatHistory)
    );
    console.log({ assistantOptions });

    // Get formatted user choice
    const userChoice = getUserChoice(userInput, assistantOptions);
    dispatch(setUserPrompt(userChoice));

    setUserChoicesPerStep((prevChoices) => ({
      ...prevChoices,
      [currentStep]: userChoice,
    }));

    let nextStepKey;

    // Find the next step based on the current step's string value
    const currentStepIndex = Object.values(steps).indexOf(currentStep);
    if (
      currentStepIndex !== -1 &&
      currentStepIndex < Object.values(steps).length - 1
    ) {
      nextStepKey = Object.values(steps)[currentStepIndex + 1];
    }

    let formattedChoice = "";

    console.log({ currentStep, nextStepKey });

    if (nextStepKey === "Write Story" && userChoicesPerStep) {
      const userChoicesString = formatUserChoices(userChoicesPerStep);
      formattedChoice = `All steps are completed! I want the choices for each step that I have chosen to be used as the foundation of a story to be created. I want you to create a 1000 word minimum short story based off all the choices chosen per step.
      Here are the choices per step that were chosen for you to base the short story off of:\n\n${userChoicesString}\n\n
      I want the story to not explicitly include the choices word for word but be descriptive enough that all of the choices can be inferred and understood by the reader.`;
    } else {
      formattedChoice = `I choose ${userChoice} for ${currentStep}. Please remember that chose for future prompts. Provide 10 numbered options for ${nextStepKey} and provide the options based on all of the previous choices I have chosen in a numbered list with the title at the top as ${nextStepKey} without any symbols, characters, colons or anything else but the title in letters only.`;
    }

    console.log(formattedChoice);

    dispatch(setFormattedUserChoice(formattedChoice));

    handleGenerateResponse(chatHistory, formattedChoice);
    setUserInput("");
  };

  useEffect(() => {
    console.log({ response });
  }, [response]);

  useEffect(() => {
    setCurrentStep(getCurrentStep(chatHistory));
    console.log({ chatHistory });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHistory]);

  return (
    <Container component="main">
      <Typography component="h1" variant="h4">
        Story Craft
      </Typography>

      <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
        {hasStarted ? (
          <>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="prompt-description"
              label={isLoading ? "Loading..." : `Enter Prompt Here`}
              name="prompt-description"
              autoFocus
              disabled={isLoading}
              value={userInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserInput(e.target.value)
              }
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={isLoading}>
              Generate response
            </Button>
          </>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            sx={{ mt: 3 }}
            onClick={startApplication}>
            Start
          </Button>
        )}
      </Box>

      <Typography component="pre" variant="body1" sx={{ mt: 3 }}>
        <ReactMarkdown>{response}</ReactMarkdown>
      </Typography>
    </Container>
  );
}
