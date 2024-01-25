import cors from "cors";
import express from "express";
import generate from "./generate.js";
import openAiRoutes from "./routes/openai.js";

const port = process.env.PORT || 3002;
const app = express();

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({ origin: "*" }));

app.use("/openai", openAiRoutes);

app.post("/generate", async (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const { userPromptDescription, existingChatHistory } = req.body;
  console.log(req.body, "req.body");
  try {
    const { response, reason } = await generate(
      userPromptDescription,
      existingChatHistory
    );
    console.log({ response, reason });
    res.json({ response, reason });
    // res.write(`data: ${JSON.stringify({ response, reason })}\n\n`);
    // res.end();
   
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
