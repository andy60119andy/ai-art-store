import type {
  AiImageProvider,
  GenerateArtworkInput,
  GenerateArtworkOutput,
} from "./types";
import { validateImage } from "./image-validation";

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/edits";

class OpenAiImageProvider implements AiImageProvider {
  async generate(input: GenerateArtworkInput): Promise<GenerateArtworkOutput> {
    const apiKey =
      process.env.OPENAI_API_KEY ?? process.env.AI_PROVIDER_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

    const sourceResponse = await fetch(input.imageUrl, {
      signal: AbortSignal.timeout(15000),
    });
    if (!sourceResponse.ok) {
      throw new Error(`SOURCE_IMAGE_FETCH_FAILED:${sourceResponse.status}`);
    }

    const source = await validateImage(
      Buffer.from(await sourceResponse.arrayBuffer()),
    );
    const form = new FormData();
    const model = process.env.OPENAI_IMAGE_MODEL;
    if (!model) throw new Error("OPENAI_IMAGE_MODEL is not configured.");
    form.append("model", model);
    form.append(
      "prompt",
      [
        "Transform the supplied image into a high-quality printable artwork.",
        "Preserve the main subject, identity, composition, and important details of the source image.",
        "Do not add text, logos, watermarks, borders, or signatures.",
        input.styleKey ? `Art style: ${input.styleKey}.` : "",
        input.prompt || "",
      ]
        .filter(Boolean)
        .join(" "),
    );
    form.append("size", process.env.OPENAI_IMAGE_SIZE || "1024x1024");
    form.append(
      "image",
      new File([new Uint8Array(source.bytes)], `source.${source.ext}`, {
        type: source.mime,
      }),
    );

    const response = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(240000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `OPENAI_IMAGE_GENERATION_FAILED:${response.status}:${detail.slice(0, 1000)}`,
      );
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
