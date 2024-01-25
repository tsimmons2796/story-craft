import openai from "./api.js";

const generate = async (userPrompt, existingChatHistory = []) => {
  // console.log(userPrompt, "userPrompt");
  // console.log(existingChatHistory, "existingChatHistory");

  const formattedMessages = existingChatHistory.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  formattedMessages.push({ role: "user", content: `${userPrompt}` });

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: formattedMessages,
  });

  const responseMessage = response.choices[0].message.content;
  // console.log(responseMessage, "responseMessage");

  return responseMessage;
};

export default generate;


