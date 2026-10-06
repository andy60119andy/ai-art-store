import type { AiImageProvider, GenerateArtworkInput, GenerateArtworkOutput } from "./types";

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/edits";

class OpenAiImageProvider implements AiImageProvider {
  async generate(input: GenerateArtworkInput): Promise<GenerateArtworkOutput> {
    const apiKey = process.env.OPENAI_API_KEY ?? process.env.AI_PROVIDER_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

    const sourceResponse = await fetch(input.imageUrl);
    if (!sourceResponse.ok) {
      throw new Error(`SOURCE_IMAGE_FETCH_FAILED:${sourceResponse.status}`);
    }

    const sourceBlob = await sourceResponse.blob();
    const contentType = sourceResponse.headers.get("content-type") || "image/png";
    const extension = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : contentType.includes("webp") ? "webp" : "png";
    const form = new FormData();
    form.append("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-2");
    form.append(
      "prompt",
      [
        "Transform the supplied image into a high-quality printable artwork.",
        "Preserve the main subject, identity, composition, and important details of the source image.",
        "Do not add text, logos, watermarks, borders, or signatures.",
        input.styleKey ? `Art style: ${input.styleKey}.` : "",
        input.prompt || "",
      ].filter(Boolean).join(" "),
    );
    form.append("size", process.env.OPENAI_IMAGE_SIZE || "1024x1024");
    form.append("image", new File([sourceBlob], `source.${extension}`, { type: contentType }));

    const response = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`OPENAI_IMAGE_GENERATION_FAILED:${response.status}:${detail.slice(0, 1000)}`);
    }

    const payload = (await response.json()) as {
      data?: Array<{ b64_json?: string; revised_prompt?: string }>;
    };
    const b64 = payload.data?.[0]?.b64_json;
    if (!b64) throw new Error("OPENAI_IMAGE_GENERATION_EMPTY_RESULT");

    return {
      providerJobId: undefined,
      outputUrl: `data:image/png;base64,${b64}`,
      status: "succeeded",
    };
  }
}

let provider: AiImageProvider | undefined;

export function getAiProvider(): AiImageProvider {
  provider ??= new OpenAiImageProvider();
  return provider;
}
