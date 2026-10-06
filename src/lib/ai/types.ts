export type GenerateArtworkInput = {
  imageUrl: string;
  styleKey: string;
  prompt?: string;
};

export type GenerateArtworkOutput = {
  providerJobId?: string;
  outputUrl?: string;
  status: "queued" | "processing" | "succeeded" | "failed";
  error?: string;
};

export interface AiImageProvider {
  generate(input: GenerateArtworkInput): Promise<GenerateArtworkOutput>;
}