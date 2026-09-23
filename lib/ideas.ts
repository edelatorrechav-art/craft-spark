import { z } from "zod";

// The exact shape we ask the AI to return. The API route hands this to
// Claude as a JSON schema, so every idea comes back in the same format.
export const IdeaSchema = z.object({
  name: z.string().describe("Catchy project name"),
  item: z.string().describe("The blank item to decorate"),
  vinylType: z.string().describe("Recommended vinyl type"),
  vinylReason: z.string().describe("One sentence on why this vinyl suits this item"),
  phrase: z.string().describe("The exact phrase/text to cut"),
  designConcept: z.string().describe("Short description of the design layout and graphics"),
  fonts: z.array(z.string()).describe("2-3 font style suggestions"),
  materials: z.array(z.string()).describe("Materials and tools needed"),
  applicationTips: z.array(z.string()).describe("Short application tips"),
  careInstructions: z.string().describe("How the finished item should be cared for"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  estimatedTime: z.string().describe("e.g. '30-45 minutes'"),
  estimatedMaterialCost: z.string().describe("Per-item material cost in USD, e.g. '$4-6'"),
  suggestedPrice: z.string().describe("Suggested per-item selling price in USD, e.g. '$18-22'"),
  svgKeywords: z.array(z.string()).describe("2-3 short search keywords for finding a matching SVG"),
  svg: z.string().describe("Complete starter SVG markup"),
});

export const IdeasResponseSchema = z.object({
  ideas: z.array(IdeaSchema),
});

export type Idea = z.infer<typeof IdeaSchema>;
