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
  const { userPromptDescription, existingChatHistory } = req.body;
  console.log(req.body, "req.body");
  try {
    const responseFromApi = await generate(
      userPromptDescription,
      existingChatHistory
    );
    console.log(responseFromApi, "responseFromApi");
    res.json({ responseFromApi });
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
