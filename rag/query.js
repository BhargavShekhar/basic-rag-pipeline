import "dotenv/config.js";

import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";

const API_KEY = process.env.OPEN_AI_API_KEY;

const client = new OpenAI({
    apiKey: API_KEY
})

async function query(userQuery) {
    if (typeof userQuery !== "string" || userQuery === "") {
        throw new Error("User Query must be a valid string");
    }

    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: API_KEY
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url: 'http://localhost:6333',
            collectionName: 'dsa-docs'
        }
    );

    const vectorRetriver = vectorStore.asRetriever({ k: 5 }); // at max 5 chunks
    const results = await vectorRetriver.invoke(userQuery);

    const SYSTEM_PROMPT = `
     You are an expert in anwering user query based on the provided context about the documnet.
     Do not anwer anything beyound what is provided.

     Always always answer the user in sort and also tell on which page number the content is available to reffer

     User Documents:
        ${results.map(result => JSON.stringify({
        pageContent: result.pageContent,
        pageNumber: result.metadata.loc.pageNumber
    })).join('\n\n')}
    `;

    const llmResponse = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userQuery }
        ]
    });

    console.log(llmResponse.choices[0].message.content);
}

query("Tell me about human digestive system");