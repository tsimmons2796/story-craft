import openai from "./api.js";

const generate = async (userPrompt, existingChatHistory = []) => {
  const formattedMessages = existingChatHistory.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  formattedMessages.push({ role: "user", content: `${userPrompt}` });

  const response = await openai.chat.completions.create({
    // model: "gpt-4-turbo",
    model: "gpt-3.5-turbo",
    messages: formattedMessages,
    stream: true,
  });
  // create variables to collect the stream of chunks
  const collectedChunks = [];
  const collectedMessages = [];

  for await (const chunk of response) {
    collectedChunks.push(chunk); // # save the event response
    let chunkMessage = chunk.choices[0].delta.content;
    if (chunkMessage) {
      // # extract the message
      collectedMessages.push(chunkMessage); // # save the message
      console.log(`Message received request: ${chunkMessage}`); // # print the delay and text
    }
  }

  // for await (const chunk of response) {
  //   process.stdout.write(chunk.choices[0]?.delta?.content || "");
  // }

  // const responseMessage = response.choices[0].message.content;
  // console.log(collectedChunks);
  // console.log(collectedMessages);
  const collectedMessagesResponse = collectedMessages.join(",");
  console.log(collectedMessagesResponse);
  const responseMessage = response.choices[0].message.content;
  const finishReason = response.choices[0].finish_reason;

  return {
    response: responseMessage,
    reason: finishReason,
  };
};

export default generate;
