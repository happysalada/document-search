import type { Actions } from "./$types";
import { error } from "@sveltejs/kit";
import { UNSTRUCTURED_API_KEY, HUGGINGFACE_API_TOKEN } from "$env/static/private";
import { getEncoding } from 'js-tiktoken';

// our embedding accept maximum of 512 but we use a different tokenizer
// so we account for a difference in tokenization
const CHUNK_SIZE = 500;

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
            "unstructured-api-key": UNSTRUCTURED_API_KEY,
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
        let tokenList = chunkArray(encoding.encode(documentText), CHUNK_SIZE).map(chunk => encoding.decode(chunk));
        console.log(tokenList)
        return tokenList
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
