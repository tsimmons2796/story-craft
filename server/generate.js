import openai from "./api.js";

const generate = async (userPrompt, existingChatHistory = []) => {
  const formattedMessages = existingChatHistory.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  formattedMessages.push({ role: "user", content: `${userPrompt}` });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    // model: "gpt-4",
    messages: formattedMessages,
  });

  const responseMessage = response.choices[0].message.content;
  const finishReason = response.choices[0].finish_reason;

  return {
    response: responseMessage,
    reason: finishReason,
  };
};

export default generate;

