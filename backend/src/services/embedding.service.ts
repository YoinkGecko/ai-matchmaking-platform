const OLLAMA_URL = "http://localhost:11434";

export const generateEmbedding = async (text: string) => {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const data = await response.json();

  return data.embedding as number[];
};
