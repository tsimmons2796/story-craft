import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { getCurrentStep, steps } from "./utils/get-current-step";
import {
  extractAssistantOptions,
  formatUserChoices,
  getUserChoice,
} from "./utils/options-and-choices";
import { useChatHistory } from "./hooks/useChatHistory";

//  Example:{
//     Tone: "Suspenseful",
//     Complexity: "Psychological manipulation and mind games",
//     Setting: "Isolated mountain village",
//     mainCharacters:
//       "Emily, a young artist who seeks solace in the mountains after a tragic loss and discovers an ancient secret.",
//     primaryConflict:
//       "The Memory Thief: Emily discovers a magical artifact that allows her to enter other people's memories. However, she soon realizes that someone is using this power nefariously, erasing memories and manipulating lives. Emily must unravel the mystery and put a stop to the memory thief before all of her loved ones lose their identities.",
//     Mood: "Gritty and Intense - The memory thief's manipulations create a gritty and intense atmosphere. Emily must confront dark truths and face dangerous challenges, leading to a raw and emotionally charged mood throughout the story.",
//     Themes:
//       "Themes of Memory and Identity: Examine the connection between memory and personal identity, as well as the implications of altering or erasing memories. Raise questions about the nature of identity and how memories shape who we are.",
//     Motifs:
//       "Dreams and Visions: Explore the recurring motifs of dreams and visions as characters grapple with memories and their impact on their present reality. These surreal experiences serve as a visual representation of the blurred boundaries between memory and identity.",
//     pointOfView:
//       "Emily's First-Person Perspective: Experience the story through Emily's eyes as she navigates the dreams and visions that unlock memories and chart her journey of self-discovery.",
//     timePeriod: "Ancient Mythological Era",
//   }
export default function App() {
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [userChoicesPerStep, setUserChoicesPerStep] =
    useState<Record<string, string>>();

  const { chatHistory, setChatHistory, generateResponse } = useChatHistory();

  const [currentStep, setCurrentStep] = useState<string>(() =>
    getCurrentStep(chatHistory)
  );

  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const startApplication = async () => {
    const userMessage =
      "Provide me with 10 random and unique Tones for a story in a numbered list with a title at the top. Be very broad and unique with the suggestions. The title should be 'Story Tones' without any colons or symbols after it.";
    const prompt = await generateResponse(userMessage, chatHistory);
    setChatHistory([
      ...chatHistory,
      { role: "user", content: userMessage },
      { role: "assistant", content: prompt },
    ]);
    setResponse(prompt);
    setHasStarted(true);
    setCurrentStep(
      getCurrentStep([...chatHistory, { role: "assistant", content: prompt }])
    );
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Extract assistant options
    const assistantOptions = extractAssistantOptions(
      response,
      getCurrentStep(chatHistory)
    );

    // Get user choice
    const userChoice = getUserChoice(userPrompt, assistantOptions);

    // Update userChoicesPerStep with camelCased key if the current step contains spaces
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
    } else {
      // If current step is not found or is the last step, set it to "Tone" (restart)
      nextStepKey = "Tone";
    }

    let formattedChoice = `I choose ${userChoice} for ${currentStep}. Please remember that chose for future prompts. Provide 10 numbered options for ${nextStepKey} and provide the options based on all of the previous choices I have chosen in a numbered list with the title at the top as ${nextStepKey} without any symbols, characters, colons or anything else but the title in letters only.`;

    setChatHistory([
      ...chatHistory,
      { role: "user", content: formattedChoice },
    ]);

    const prompt = await generateResponse(formattedChoice, chatHistory);

    // Add assistant's message to chatHistory
    setChatHistory([...chatHistory, { role: "assistant", content: prompt }]);
    if (currentStep !== "Time Period") {
      setCurrentStep(
        getCurrentStep([...chatHistory, { role: "assistant", content: prompt }])
      );
    } else {
      setCurrentStep("Story");
    }
    setResponse(prompt);
    setUserPrompt("");
  };

  const submitFinalPrompt = async (finalPrompt: string) => {
    console.log("submitting final prompt", finalPrompt);
    const prompt = await generateResponse(finalPrompt, chatHistory);
    setChatHistory((prevChatHistory) => {
      console.table([
        ...prevChatHistory,
        { role: "user", content: finalPrompt },
        { role: "assistant", content: prompt },
      ]);
      return [
        ...prevChatHistory,
        { role: "user", content: finalPrompt },
        { role: "assistant", content: prompt },
      ];
    });
    console.log(
      getCurrentStep([...chatHistory, { role: "assistant", content: prompt }]),
      "getCurrentStep([...chatHistory, { role: assistant, content: prompt }])"
    );
    // setCurrentStep(
    //   getCurrentStep([...chatHistory, { role: "assistant", content: prompt }])
    // );
    // setCurrentStep("Story");
    setResponse(prompt);
    setUserPrompt("");
  };

  useEffect(() => {
    if (userChoicesPerStep) {
      const allStepsFulfilled = Object.values(steps).every((step) =>
        userChoicesPerStep.hasOwnProperty(step)
      );

      if (allStepsFulfilled) {
        const userChoicesString = formatUserChoices(userChoicesPerStep);
        const finalUserPrompt = `All steps are completed! I want the choices for each step that I have chosen to be used as the foundation of a story to be created. I want you to create a 1000 word minimum short story based off all the choices chosen per step.
      Here are the choices per step that were chosen for you to base the short story off of:\n\n${userChoicesString}\n\n
      I want the story to not explicitly include the choices word for word but be descriptive enough that all of the choices can be inferred and understood by the reader.`;

        setChatHistory([
          {
            role: "system",
            content: `You are an assistant that helps users craft high-level concepts and ideas for their stories. Focus on providing foundational concepts in the following areas: Tone and Complexity, Setting, Main Characters, Primary Conflict, Mood, Themes and Motifs, Point of View, and Time Period. Avoid spoilers, climaxes, or in-depth plot specifics. The user will specify the option you have provided by name or the number as you will always provide a numbered list of options for the user to choose from. Or the user can input their own response if none of the provided options are good enough for the user. You will not start until the user says the phrase 'Let's get crackin!' After all of the steps have has a choice been chosen for it, I want you to create a short story based off of all of the answer provided for each step. These answers will serve as the foundation of a story to be created. The story should not be reptitive, and must be a minimum of one thousand words and must be based off of the users choices per step.`,
          },
        ]);
        // Call the function to handle the final submission
        submitFinalPrompt(finalUserPrompt);
      }
    }
    console.log(userChoicesPerStep, "userChoicesPerStep");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userChoicesPerStep]);

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
              label="Enter Prompt Here"
              name="prompt-description"
              autoFocus
              value={userPrompt}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserPrompt(e.target.value)
              }
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
            >
              Generate response
            </Button>
          </>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            sx={{ mt: 3 }}
            onClick={startApplication}
          >
            Start
          </Button>
        )}
      </Box>

      <Typography component="pre" variant="body1" sx={{ mt: 3 }}>
        {response}
      </Typography>
    </Container>
  );
}
