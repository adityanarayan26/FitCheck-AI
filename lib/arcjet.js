import arcjet, { fixedWindow } from "@arcjet/next";

// Virtual Try-On: 3 requests per 12 hours
export const ajVirtualTryOn = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"], // Rate limit by IP address
  rules: [
    fixedWindow({
      mode: "LIVE",
      max: 3,
      window: "12h",
    }),
  ],
});

// Image Advisor: 1 request per 2 minutes (cooldown)
export const ajImageAdvisor = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      max: 1,
      window: "2m",
    }),
  ],
});
