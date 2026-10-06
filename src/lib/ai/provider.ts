import type { AiImageProvider, GenerateArtworkInput, GenerateArtworkOutput } from "./types";

class ConfiguredProvider implements AiImageProvider {
  async generate(_input: GenerateArtworkInput): Promise<GenerateArtworkOutput> {
    const apiKey = process.env.AI_PROVIDER_API_KEY;
    if (!apiKey) {
      throw new Error("AI_PROVIDER_API_KEY is not configured.");
    }
    throw new Error("AI provider adapter is ready; configure a concrete provider before production generation.");
  }
}

let provider: AiImageProvider | undefined;

export function getAiProvider(): AiImageProvider {
  provider ??= new ConfiguredProvider();
  return provider;
}