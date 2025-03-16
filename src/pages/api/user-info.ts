import type { NextApiRequest, NextApiResponse } from "next";
import { UAParser } from "ua-parser-js";
import maxmind from "maxmind";
import path from "path";

type Data = {
  userAgent?: string;
  ip?: string;
  country?: string;
  city?: string;
  isMobile?: boolean;
  error?: string;
};

// Initialize MaxMind databases
let countryLookup: any;
let cityLookup: any;

async function loadDatabases() {
  if (!countryLookup || !cityLookup) {
    countryLookup = await maxmind.open(
      path.join(process.cwd(), "GeoLite2-Country.mmdb"),
    );
    cityLookup = await maxmind.open(
      path.join(process.cwd(), "GeoLite2-City.mmdb"),
    );
  }
}

function getClientIp(req: NextApiRequest): string {
  const cfConnectingIp = req.headers["cf-connecting-ip"];
  if (cfConnectingIp) {
    return Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    return (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
      .split(",")[0]
      .trim();
  }

  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  return req.socket.remoteAddress || "0.0.0.0";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await loadDatabases();

    const ip = getClientIp(req);
    const ua = req.headers["user-agent"] || "";
    const parser = new UAParser(ua);
    const isMobile = parser.getDevice().type === "mobile";

    const countryGeolocation = countryLookup?.get(ip);
    const cityGeolocation = cityLookup?.get(ip);

    return res.status(200).json({
      userAgent: parser.getResult().ua,
      ip,
      country: countryGeolocation?.country?.names?.en,
      city: cityGeolocation?.city?.names?.en,
      isMobile,
    });
  } catch (error) {
    console.error("Error processing user info:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Error processing user info",
    });
  }
}
