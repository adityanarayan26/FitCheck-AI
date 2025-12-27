import arcjet, { fixedWindow } from "@arcjet/next";

// Virtual Try-On: 2 requests per 2 minutes
export const ajVirtualTryOn = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"], // Rate limit by IP address
  rules: [
    fixedWindow({
      mode: "LIVE",
      max: 2,
      window: "2m",
    }),
  ],
});

// Image Advisor: 4 requests per 1 minute (cooldown)
export const ajImageAdvisor = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      max: 4,
      window: "1m",
    }),
  ],
});
