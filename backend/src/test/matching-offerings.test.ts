import { findSimilarOfferings } from "../services/matching.service";

const test = async () => {
  const requirementId =
    "03d69fb5-069e-4551-ba88-6a4e8244af32";

  const offerings = await findSimilarOfferings(
    requirementId,
    10
  );

  console.log("\nSimilar offerings:\n");

  for (const offering of offerings) {
    console.log({
      id: offering.id,
      supplierId: offering.supplier_id,
      product: offering.product_offered,
      quantity: offering.available_quantity,
      unit: offering.unit,
      price: offering.price,
      location: offering.fulfillment_location,
      semanticScore: Number(
        offering.semantic_score
      ).toFixed(4),
    });
  }

  process.exit(0);
};

test();