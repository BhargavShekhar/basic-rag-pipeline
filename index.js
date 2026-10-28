import "dotenv/config.js";

import OpenAI from "openai";

const API_KEY = process.env.OPEN_AI_API_KEY;
const client = new OpenAI({
    apiKey: API_KEY
});

(async function main() {
    const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: "Write a short bedtime story about a unicorn.",
    });

    console.log(response.output_text);
})();