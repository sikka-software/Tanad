import type { NextApiRequest, NextApiResponse } from "next";

import { updatePriceFeatures, updateProductFeatures } from "@/lib/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId, productId, features } = req.body;

    if ((!priceId && !productId) || !features || !Array.isArray(features)) {
      return res.status(400).json({
        error: "Either priceId or productId and valid features array are required",
      });
    }

    let success = false;

    // Update price features if priceId is provided
    if (priceId) {
      success = await updatePriceFeatures(priceId, features);
    }

    // Update product features if productId is provided
    if (productId) {
      success = await updateProductFeatures(productId, features);
    }

    if (!success) {
      return res.status(500).json({
        error: "Failed to update features",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Features updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating features:", error);
    return res.status(500).json({
      error: "Failed to update features",
      message: error.message || "Unknown error",
    });
  }
}
