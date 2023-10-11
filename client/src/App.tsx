import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { Message } from "./interfaces/message.interface";
import { getCurrentStep, steps } from "./utils/get-current-step";
import {
  extractAssistantOptions,
  formatUserChoices,
  getUserChoice,
  toCamelCase,
} from "./utils/options-and-choices";

export default function App() {
  console.log("App rendered");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [userChoicesPerStep, setUserChoicesPerStep] = useState<
    Record<string, string>
  >({
    Tone: "Satirical",
    Complexity: "Humorous Complexity",
    Setting:
      "A quirky coffee shop frequented by quirky regulars who always find themselves in strange situations.",
    mainCharacters:
      "Jasper, a washed-up actor who constantly rehearses monologues while sipping his coffee.",
    primaryConflict:
      "Jasper's past mistakes and regrets come back to haunt him, jeopardizing his chances of redemption.",
    Mood: "Humorous and Self-Deprecating",
    Themes:
      "Overcoming Self-Doubt: Jasper battles self-doubt as he confronts his past and finds the strength to believe in his own abilities and worth.",
    Motifs:
      "Coffee Cups: Symbolizing comfort and familiarity, coffee cups appear throughout the story, representing Jasper's refuge as he battles self-doubt.",
    pointOfView:
      "Anonymous Narrator: A seemingly neutral and detached narrator tells Jasper's story, adding an air of mystery and suspense.",
    timePeriod: "Ancient Mythological Era",
  });
  // const [userChoicesPerStep, setUserChoicesPerStep] = useState<
  //   Record<string, string>
  // >({});
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      role: "system",
      content: `You are an assistant that helps users craft high-level concepts and ideas for their stories. Focus on providing foundational concepts in the following areas: Tone and Complexity, Setting, Main Characters, Primary Conflict, Mood, Themes and Motifs, Point of View, and Time Period. Avoid spoilers, climaxes, or in-depth plot specifics. The user will specify the option you have provided by name or the number as you will always provide a numbered list of options for the user to choose from. Or the user can input their own response if none of the provided options are good enough for the user. You will not start until the user says the phrase 'Let's get crackin!' After all of the steps have has a choice been chosen for it, I want you to create a short story based off of all of the answer provided for each step. These answers will serve as the foundation of a story to be created. The story should not be reptitive, and must be a minimum of one thousand words and must be based off of the users choices per step.`,
    },
  ]);
  const [currentStep, setCurrentStep] = useState<string>(() =>
    getCurrentStep(chatHistory)
  );

  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const startApplication = async () => {
    console.log("Story Crafting Initiated");
    const userMessage =
      "Provide me with 10 random and unique Tones for a story in a numbered list with a title at the top. Be very broad and unique with the suggestions. The title should be 'Story Tones' without any colons or symbols after it.";
    const prompt = await generateResponse(userMessage, chatHistory);
    setChatHistory([...chatHistory, { role: "assistant", content: prompt }]);
    setResponse(prompt);
    setHasStarted(true);
    setCurrentStep(
      getCurrentStep([...chatHistory, { role: "assistant", content: prompt }])
    );
  };

  const generateResponse = async (
    userPromptParam: string,
    chatHistoryParam: Message[]
  ): Promise<string> => {
    const generatedResponse = await fetch("http://localhost:3002/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userPromptDescription: userPromptParam,
        existingChatHistory: chatHistoryParam,
      }),
    });

    const data = await generatedResponse.json();
    setChatHistory((prevChatHistory) => [
      ...prevChatHistory,
      { role: "assistant", content: data },
    ]);

    return data.responseFromApi;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Extract assistant options
    const assistantOptions = extractAssistantOptions(
      response,
      getCurrentStep(chatHistory)
    );
    console.log(assistantOptions, "assistantOptions");

    // Get user choice
    const userChoice = getUserChoice(userPrompt, assistantOptions);
    console.log(userChoice, "userChoice");

    const stepKey = currentStep.includes(" ")
      ? toCamelCase(currentStep)
      : currentStep;

    // Update userChoicesPerStep with camelCased key if the current step contains spaces
    setUserChoicesPerStep((prevChoices) => ({
      ...prevChoices,
      [stepKey]: userChoice,
    }));

    console.log(currentStep, "currentStep");
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

    let formattedChoice = `I choose ${userChoice} for ${currentStep}. Provide 10 numbered options for ${nextStepKey} and provide the options based on all of the previous choices I have chosen in a numbered list with the title at the top as ${nextStepKey} without any symbols, characters, colons or anything else but the title in letters only.`;
    console.log(formattedChoice, "formattedChoice");

    setChatHistory([
      ...chatHistory,
      { role: "user", content: formattedChoice },
    ]);

    const prompt = await generateResponse(formattedChoice, chatHistory);

    // Add assistant's message to chatHistory
    setChatHistory([...chatHistory, { role: "assistant", content: prompt }]);
    setCurrentStep(
      getCurrentStep([...chatHistory, { role: "assistant", content: prompt }])
    );
    setResponse(prompt);
    setUserPrompt("");
  };

  useEffect(() => {
    console.log(getCurrentStep(chatHistory), "getCurrentStep(chatHistory)");
    console.log(userChoicesPerStep, "userChoicesPerStep");
  }, [chatHistory, userChoicesPerStep]);

  const submitFinalPrompt = async (finalPrompt: string) => {
    const prompt = await generateResponse(finalPrompt, chatHistory);
    setChatHistory((prevChatHistory) => [
      ...prevChatHistory,
      { role: "user", content: finalPrompt },
      { role: "assistant", content: prompt },
    ]);
    setCurrentStep(
      getCurrentStep([...chatHistory, { role: "assistant", content: prompt }])
    );
    setResponse(prompt);
    setUserPrompt("");
  };

  useEffect(() => {
    const allStepsFulfilled = Object.values(steps).every((step) =>
      userChoicesPerStep.hasOwnProperty(toCamelCase(step))
    );

    if (allStepsFulfilled) {
      const userChoicesString = formatUserChoices(userChoicesPerStep);
      const finalUserPrompt = `All steps are completed! These steps and their choices will be used as the foundation of a story to be created. I want you to create a 1000 word minimum short story based off all the choices chosen per step.
      Here are the choices per step that were chosen for you to base the short story off of:\n\n${userChoicesString}\n\n`;

      // Call the function to handle the final submission
      submitFinalPrompt(finalUserPrompt);
    }
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
