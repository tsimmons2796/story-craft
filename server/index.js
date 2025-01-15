import cors from "cors";
import express from "express";
import generate from "./generate.js";
import openAiRoutes from "./routes/openai.js";

const port = process.env.PORT || 3002;
const app = express();

app.use(express.json({ limit: "30mb" }));
app.use(cors({ origin: "*" }));

app.use("/openai", openAiRoutes);

app.get("/generate", async (req, res) => {
  // Set SSE headers
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const userPromptDescription = req.query.userPromptDescription || "";
  const existingChatHistory = JSON.parse(req.query.existingChatHistory || "[]");

  console.log("Received query params:", {
    userPromptDescription,
    existingChatHistory,
  });

  try {
    // Call the generate function to get the response
    const { response, reason } = await generate(
      userPromptDescription,
      existingChatHistory
    );

    // Stream the response progressively
    for (const chunk of response.split("\n")) {
      res.write(`data: ${chunk}\n\n`);
    }

    // Signal the end of the stream
    if (reason === "length") {
      res.write("data: [STREAM_ENDED] Continue generating?\n\n");
    }

    res.write("data: [COMPLETE]\n\n"); // Explicitly mark the stream as complete
    res.end(); // Close the stream only after marking it complete
  } catch (error) {
    console.error("Error in /generate:", error);
    res.write("data: Internal Server Error\n\n");
    res.end();
  }
});


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
