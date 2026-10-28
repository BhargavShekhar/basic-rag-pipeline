import "dotenv/config.js";

import path from 'node:path';
import { fileURLToPath } from "node:url";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

async function generateVectorEmbeddingsForFile(filepath) {
    filepath = filepath.trim();

    if (typeof filepath !== "string" || filepath === "") {
        throw new Error("File path must be string and non empty");
    }

    const loader = new PDFLoader(filepath);

    const document = await loader.load();

    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPEN_AI_API_KEY
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url: 'http://localhost:6333',
            collectionName: 'dsa-docs'
        }
    );

    await vectorStore.addDocuments(document);

    console.log(`All the documnets are indexed !!`);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.join(__dirname, 'DSA_Notes.pdf');

await generateVectorEmbeddingsForFile(pdfPath);