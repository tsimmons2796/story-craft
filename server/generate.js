import openai from "./api.js";

const generate = async (userPrompt, existingChatHistory = []) => {
  try {
    const formattedMessages = existingChatHistory.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    formattedMessages.push({ role: "user", content: userPrompt });

    console.log({ updatedFormattedMessages: formattedMessages });

    // Send the request to OpenAI with streaming enabled
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: formattedMessages,
      stream: true,
    });

    let finishReason = null;
    const chunks = [];

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        chunks.push(content);
        console.log(`Chunk received: ${content}`);
      }
      if (chunk.choices[0]?.finish_reason) {
        finishReason = chunk.choices[0].finish_reason;
      }
    }

    const fullResponse = chunks.join("");
    console.log("Stream complete. Full response assembled:", fullResponse);

    return {
      response: fullResponse,
      reason: finishReason,
    };
  } catch (error) {
    console.error("Error in generate function:", error);
    throw error; // Let the calling function handle the error
  }
};

export default generate;
