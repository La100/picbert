import { fal } from "@fal-ai/client";

// Configure fal client with proxy URL for production safety
fal.config({
  proxyUrl: "/api/fal/proxy",
});

export { fal }; 