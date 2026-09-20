import { generateEmbedding } from "../services/embedding.service";

const test = async () => {
  const text =
    "Food grade stainless steel containers for industrial packaging";

  const embedding = await generateEmbedding(text);

  console.log("Embedding generated");
  console.log("Dimensions:", embedding.length);
  console.log("First 5 values:", embedding.slice(0, 5));
};

test();