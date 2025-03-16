import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuid } from "uuid";

const WEBHOOK_URL =
  "https://n8n.sikka.io/webhook/0b3e87cc-533f-4754-889d-cd23a9b34aa5/appeal";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!WEBHOOK_URL) {
    return res.status(500).json({ error: "Webhook URL not configured" });
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Entity-Ref-ID": uuid(),
        "x-form-secret": "bushky11",
      },
      body: JSON.stringify({
        title: "Appeal Form Submission",
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        comments: req.body.comments,
        pukla_link: req.body.pukla_link,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Failed to send data to webhook" });
  }
};
