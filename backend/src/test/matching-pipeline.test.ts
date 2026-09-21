import { generateMatchCandidates } from "../services/matching-pipeline.service";

const requirementId = "1a6e967a-1d16-4cad-ad60-a84b0b8ba533";

async function main() {
  const candidates = await generateMatchCandidates(requirementId);

  console.log("=== MATCH CANDIDATES ===\n");

  console.dir(candidates, {
    depth: null,
  });
}

void main();
