import type { Actions } from "./$types";
import { error } from "@sveltejs/kit";
import { HfInference } from '@huggingface/inference';
import { env } from "$env/dynamic/private";
import { getEncoding } from 'js-tiktoken';

// our embedding accept maximum of 512 but we use a different tokenizer
// so we account for a difference in tokenization
const CHUNK_SIZE = 500;
const hf = new HfInference(env.HUGGINGFACE_API_TOKEN);

export const actions = {
  default: async ({ request }) => {
    const body = await request.formData();

    try {
      const response = await fetch(
        "https://api.unstructured.io/general/v0/general",
        {
          method: "POST",
          body,
          headers: {
            Accept: "application/json",
            "unstructured-api-key": env.UNSTRUCTURED_API_KEY,
            "User-Agent": "curl/7.87.0",
          },
        },
      );
      if (!response.ok) {
        let content = await response.text();
        throw new Error(content);
      } else {
        const json = await response.json();
        const documentText = json.map(({ text }: { text: string }) => text).join("\n");
        let encoding = getEncoding("cl100k_base");
        let chunks = chunkArray(encoding.encode(documentText), CHUNK_SIZE).map(chunk => encoding.decode(chunk));
        let embeddings = await Promise.all(chunks.map(async chunk => {
          let features = await hf.featureExtraction({
            model: 'BAAI/bge-base-en-v1.5',
            inputs: chunk,
          }) as number[]
          return features
        }));
        console.log(embeddings)
        const qdrantSearchRespone = await fetch(
          `https://qdrant.megzari.com/collections/${env.COLLECTION}/points/search/batch`,
          {
            method: "POST",
            body: JSON.stringify({
              searches: embeddings.map(embedding => ({ vector: embedding, with_payload: true }))
            }),
            headers: {
              Accept: "application/json",
            },
          },
        );
        const qdrantSearchJson = await qdrantSearchRespone.json();
        console.log(qdrantSearchJson)
        let ordered = qdrantSearchJson.result.flat().sort((a, b) => b.score - a.score);
        return ordered
      }
    } catch (err) {
      console.log(err);
      throw error(500, error.toString());
    }
  },
} satisfies Actions;


function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  return array.reduce<T[][]>((acc, item, index) => {
    const chunkIndex = Math.floor(index / chunkSize);

    if (!acc[chunkIndex]) {
      acc[chunkIndex] = [];  // start a new chunk
    }

    acc[chunkIndex].push(item);

    return acc;
  }, []);
}
