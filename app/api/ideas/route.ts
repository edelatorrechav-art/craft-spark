import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { IdeasResponseSchema, type Idea } from "@/lib/ideas";
import { ALL_ITEMS, ALL_VINYLS, OCCASIONS, VIBES } from "@/lib/options";
import { roughCleanSvg } from "@/lib/svg";

// Give the AI up to 60 seconds to answer (Vercel's default is shorter).
export const maxDuration = 60;

const MODEL = "claude-haiku-4-5-20251001";

// What the page is allowed to send us.
const RequestSchema = z.object({
  occasion: z.enum(OCCASIONS),
  recipient: z.string().trim().max(500).default(""),
  vibe: z.enum(VIBES),
  item: z.string().refine((v) => ALL_ITEMS.includes(v)),
  vinyl: z.string().refine((v) => ALL_VINYLS.includes(v)),
  budget: z.string().trim().max(20).default(""),
  quantity: z.string().trim().max(20).default(""),
  // When regenerating a single card, the ideas we want something different from.
  avoid: z.array(z.string().max(200)).max(10).optional(),
  count: z.union([z.literal(1), z.literal(3)]).default(3),
});

const SYSTEM_PROMPT = `You are Craft Spark, a friendly expert Cricut and vinyl crafter who helps a small craft business plan custom projects they can make and sell.

For every idea:
- Recommend the right vinyl for the blank and explain why in one sentence. Rules of thumb: permanent adhesive vinyl for drinkware, glass, and outdoor items; removable adhesive vinyl for walls, windows, and temporary decor; iron-on/HTV for fabric (shirts, totes, onesies, hats); Infusible Ink only on polyester or sublimation-ready blanks; stencil vinyl for glass etching and painting wood signs.
- Give the exact phrase to cut, a short design concept, and 2-3 font style pairings (e.g. "bold script + sans serif"). Describe font styles, not specific commercial font names.
- List all materials: the blank, the vinyl, transfer tape (or a carrier sheet for HTV), weeding tools, and a heat press/EasyPress/mug press when needed.
- Give short, practical application tips. Always include the important gotchas: mirror the design for iron-on/HTV and Infusible Ink; clean glass and stainless with rubbing alcohol first; let permanent vinyl cure 48-72 hours before use.
- Give care instructions: e.g. hand-wash only, not dishwasher or microwave safe for permanent vinyl on mugs and tumblers; wash inside out in cold water and skip the dryer or tumble dry low for HTV.
- Give difficulty, estimated time, per-item material cost, and a realistic per-item selling price in USD that respects the customer's budget and quantity.
- Give 2-3 short search keywords that would find a matching SVG (e.g. "teacher apple", "sunflower mug").
- Make a simple starter SVG: one solid color (fill="#000000"), bold chunky shapes and the phrase as <text> in a bold, simple font-family, no gradients, filters, images, masks, clip paths, styles, scripts, links, or tiny details. Always set a viewBox. Keep each SVG compact: under 1,500 characters, few elements, short path data, whole-number coordinates.

Never include any website URLs, links, domain names, shop names, or specific SVG marketplaces anywhere in your answer. The app builds its own search links.

Keep text concise so all ideas fit in one response. Make each idea clearly different (different item or phrase or design direction) unless the customer chose a specific item.`;

function buildUserPrompt(input: z.infer<typeof RequestSchema>) {
  const lines = [
    `Please give me ${input.count === 1 ? "1 fresh project idea" : "3 project ideas"}.`,
    "",
    `Occasion: ${input.occasion}`,
    `Who it's for + their interests: ${input.recipient || "(not specified)"}`,
    `Vibe: ${input.vibe}`,
    `Item: ${input.item === "AI picks for me" ? "You pick the best blank item for each idea" : input.item}`,
    `Vinyl type: ${input.vinyl === "AI recommends" ? "You recommend the best vinyl for each item" : input.vinyl}`,
    `Budget per item: ${input.budget ? `$${input.budget.replace(/^\$/, "")}` : "(not specified)"}`,
    `Quantity: ${input.quantity || "1"}`,
  ];
  if (input.avoid?.length) {
    lines.push(
      "",
      `Make it clearly different from these existing ideas: ${input.avoid.join("; ")}`,
    );
  }
  return lines.join("\n");
}

// Belt and braces: remove anything that looks like a URL or web address.
const URL_PATTERN = /\b(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|net|org|co|io|shop|store)\b\S*/gi;
function stripUrls(text: string) {
  return text.replace(URL_PATTERN, "").replace(/\s{2,}/g, " ").trim();
}

function cleanIdea(idea: Idea): Idea {
  const s = stripUrls;
  return {
    ...idea,
    name: s(idea.name),
    item: s(idea.item),
    vinylType: s(idea.vinylType),
    vinylReason: s(idea.vinylReason),
    phrase: s(idea.phrase),
    designConcept: s(idea.designConcept),
    fonts: idea.fonts.map(s).filter(Boolean),
    materials: idea.materials.map(s).filter(Boolean),
    applicationTips: idea.applicationTips.map(s).filter(Boolean),
    careInstructions: s(idea.careInstructions),
    estimatedTime: s(idea.estimatedTime),
    estimatedMaterialCost: s(idea.estimatedMaterialCost),
    suggestedPrice: s(idea.suggestedPrice),
    svgKeywords: idea.svgKeywords.map(s).filter(Boolean).slice(0, 3),
    svg: roughCleanSvg(idea.svg),
  };
}

function friendlyError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return friendlyError(
      "The craft room isn't set up yet — the ANTHROPIC_API_KEY is missing on the server.",
      500,
    );
  }

  let input: z.infer<typeof RequestSchema>;
  try {
    input = RequestSchema.parse(await request.json());
  } catch {
    return friendlyError("Hmm, some of the form choices didn't come through. Please try again.", 400);
  }

  // The key is read on the server only; it never reaches the browser.
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(input) }],
      output_config: { format: zodOutputFormat(IdeasResponseSchema) },
    });

    if (response.stop_reason === "refusal") {
      return friendlyError(
        "The AI couldn't make ideas for that request. Try rewording who it's for.",
        422,
      );
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      return friendlyError(
        "The ideas got a little too long and were cut off. Please try again!",
        502,
      );
    }

    const ideas = response.parsed_output.ideas.slice(0, input.count).map(cleanIdea);
    if (ideas.length === 0) {
      return friendlyError("No ideas came back that time. Please try again!", 502);
    }
    return Response.json({ ideas });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic auth error:", error.message);
      return friendlyError("The API key was rejected. Double-check ANTHROPIC_API_KEY in Vercel.", 500);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return friendlyError("Lots of crafting going on right now! Wait a moment and try again.", 429);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
      return friendlyError("The idea machine hit a snag. Please try again in a moment.", 502);
    }
    console.error("Unexpected error:", error);
    return friendlyError("Something went wrong on our end. Please try again.", 500);
  }
}
