# Story Craft

Story Craft is an interactive story ideation assistant that guides users through a structured set of creative decisions and then generates a short story based on the selected options. The application combines a React + Redux front end with an Express server that streams responses from OpenAI's Chat Completions API.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Environment Variables](#environment-variables)
- [User Flow](#user-flow)
  - [1. Launch and Initialize](#1-launch-and-initialize)
  - [2. Review Assistant Suggestions](#2-review-assistant-suggestions)
  - [3. Choose or Enter Your Own Idea](#3-choose-or-enter-your-own-idea)
  - [4. Iterate Through Story-Building Steps](#4-iterate-through-story-building-steps)
  - [5. Generate the Final Story](#5-generate-the-final-story)
- [How Streaming Works](#how-streaming-works)
- [Customizing Story Craft](#customizing-story-craft)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features
- Step-by-step story development covering tone, complexity, setting, characters, conflict, mood, themes, motifs, point of view, time period, and final story generation.
- Real-time streaming of OpenAI responses so users can watch suggestions arrive without waiting for the entire completion.
- Flexible input: pick an assistant-proposed option by number, type the option text verbatim, or provide an entirely custom idea.
- Automatic tracking of previous choices to ensure later prompts respect earlier decisions.
- Markdown rendering of model output for easy reading.

## Architecture
```
workspace/
├── client/            # React front end (TypeScript, Redux Toolkit, MUI)
│   ├── src/
│   │   ├── App.tsx   # Main UI, user input handling, per-step logic
│   │   ├── redux/    # Store, slice, selectors, async actions
│   │   └── utils/    # Step definitions and option formatting helpers
└── server/            # Express API wrapper around OpenAI
    ├── index.js      # HTTP server, /generate SSE endpoint
    ├── generate.js   # Calls OpenAI chat.completions with streaming
    └── api.js        # OpenAI client initialization
```

## Prerequisites
- Node.js 18+ (required for native `fetch` and EventSource compatibility).
- An OpenAI API key with access to `gpt-3.5-turbo` (or compatible) chat models.

## Installation
Install dependencies for both the client and server.

```bash
cd server
npm install
cd ../client
npm install
```

## Running the App
Run the server and client in separate terminals (or use a process manager such as concurrently).

```bash
# Terminal 1
cd server
npm start

# Terminal 2
cd client
npm start
```

- The Express server listens on `http://localhost:3002` by default.
- The React development server starts on `http://localhost:3000`.

## Environment Variables
Create a `.env` file inside the `server` directory with at least the following variable:

```bash
OPENAI_API_KEY=sk-your-key-here
```

> **Note:** `routes/openai.js` includes legacy ChatEngine webhook code that is not used by the current flow. The only required secret for the Story Craft loop is `OPENAI_API_KEY`.

## User Flow

### 1. Launch and Initialize
- Click **Start** in the UI. `App.tsx` calls `handleGenerateResponse` without a user prompt, which dispatches the default request defined in the Redux slice (`Story Tones`).
- The server sends back an initial list of tones for the first step, and the response appears in the Markdown preview.

### 2. Review Assistant Suggestions
- Each assistant message is appended to the chat history managed in Redux (`story.chatHistory`).
- Responses are streamed chunk-by-chunk and displayed immediately thanks to the `updateResponse` reducer.

### 3. Choose or Enter Your Own Idea
- Type either the number of an option (e.g., `3`) or write your own description.
- On submit, helper utilities (`extractAssistantOptions` and `getUserChoice`) interpret the input:
  - If you provide a number, the corresponding assistant option is used.
  - If you type an exact option name, it is selected.
  - Otherwise, your free-form input is passed through.

### 4. Iterate Through Story-Building Steps
- The application keeps track of the current step via `getCurrentStep`, which inspects the latest assistant message for the step title.
- After each submission, Story Craft:
  1. Records your choice in local component state (`userChoicesPerStep`).
  2. Formats an instruction asking the assistant for the next step's suggestions, referencing all previous selections to maintain coherence.
  3. Dispatches `generateResponse`, which triggers a new streaming request to the server with the updated chat history.
- The loop repeats through tone, complexity, setting, characters, conflict, mood, themes, motifs, point of view, and time period.

### 5. Generate the Final Story
- When the last planning step is complete, the formatted prompt changes. Instead of requesting more options, it instructs the assistant to craft a minimum 1,000-word story using the accumulated choices (`formatUserChoices`).
- The final story is streamed back to the UI and appended to the conversation history for future reference.

## How Streaming Works
1. The client creates an `EventSource` pointing to `/generate` with two query parameters: the user prompt and the serialized chat history.
2. The Express route in `server/index.js` forwards the request to `generate.js`, which calls `openai.chat.completions.create` with `stream: true`.
3. As OpenAI yields chunks, the server forwards them as Server-Sent Events. The client concatenates each chunk, updates Redux state incrementally, and resolves the promise when `[COMPLETE]` is received.
4. If the API stops because of the token limit (`finish_reason === "length"`), the server emits `[STREAM_ENDED] Continue generating?`, enabling the UI to prompt for continuation if desired.

## Customizing Story Craft
- **Add or reorder steps:** Edit the `steps` object in `client/src/utils/get-current-step.ts`. Ensure prompts in `App.tsx` reflect any new steps.
- **Change the initial system behavior:** Modify the system message in `client/src/redux/slice.ts` under `initialState.chatHistory`.
- **Adjust prompt phrasing:** Tweak the templates inside `App.tsx` where `formattedChoice` is constructed.
- **Use a different OpenAI model:** Update the `model` property in `server/generate.js`.

## Troubleshooting
- **Blank responses or immediate completion:** Confirm the server is running on port `3002` and the client is pointing to the same host.
- **401 Unauthorized errors:** Verify `OPENAI_API_KEY` is correctly set in the server environment.
- **CORS issues in development:** The server enables `cors({ origin: "*" })`. If hosting elsewhere, adjust the allowed origins accordingly.
- **Streaming stops mid-way:** Check server logs. If you see `[STREAM_ENDED]`, the model hit a token limit—resubmit with an adjusted prompt or ask the assistant to continue.

## License
This project is provided under the [MIT License](LICENSE).
