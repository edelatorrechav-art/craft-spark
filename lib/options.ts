// All the choices shown in the form. Used by both the page and the API route,
// so the server can check that what it receives is a real option.

export const AI_PICKS = "AI picks for me";
export const AI_RECOMMENDS = "AI recommends";

export const OCCASIONS = [
  "Birthday",
  "Christmas",
  "Halloween",
  "Valentine's Day",
  "Easter",
  "4th of July",
  "Teacher gift",
  "Graduation",
  "Wedding",
  "Bridal / bachelorette",
  "Baby shower",
  "Mother's / Father's Day",
  "Sports team",
  "Business / branding",
  "Just because",
  "Other",
] as const;

export const VIBES = [
  "Cute",
  "Funny",
  "Elegant",
  "Rustic / farmhouse",
  "Boho",
  "Sassy",
  "Faith-based",
  "Retro",
] as const;

export const ITEM_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Drinkware",
    items: [
      "Mug",
      "Glass can / Libbey cup",
      "Stainless tumbler (20 oz)",
      "Stainless tumbler (30 oz)",
      "Stainless tumbler (40 oz)",
      "Water bottle",
      "Wine glass",
      "Stemless wine glass",
      "Coffee travel mug",
    ],
  },
  {
    label: "Apparel & fabric",
    items: [
      "T-shirt",
      "Sweatshirt / hoodie",
      "Baby onesie",
      "Tote bag",
      "Hat",
      "Apron",
      "Pillow cover",
      "Blanket",
      "Koozie",
    ],
  },
  {
    label: "Home decor",
    items: [
      "Wood sign",
      "Wall decal",
      "Door / porch sign",
      "Ornament",
      "Picture frame",
      "Mirror",
      "Glass block",
      "Cutting board",
      "Canvas",
    ],
  },
  {
    label: "Car & outdoor",
    items: [
      "Car decal",
      "Window decal",
      "Laptop / phone decal",
      "Cooler decal",
      "Mailbox lettering",
    ],
  },
  {
    label: "Party & gifts",
    items: [
      "Gift labels",
      "Favor bags",
      "Cake topper",
      "Banner",
      "Balloon decals",
      "Jar / pantry labels",
      "Keychain",
    ],
  },
  {
    label: "Business",
    items: ["Logo decal", "Storefront window lettering", "Stickers"],
  },
];

export const VINYL_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Adhesive vinyl",
    items: ["Permanent adhesive vinyl", "Removable adhesive vinyl"],
  },
  {
    label: "Iron-on / HTV",
    items: [
      "Iron-on / HTV – standard",
      "Iron-on / HTV – glitter",
      "Iron-on / HTV – holographic",
      "Iron-on / HTV – flocked",
      "Iron-on / HTV – puff",
    ],
  },
  {
    label: "Specialty",
    items: [
      "Printable vinyl",
      "Infusible Ink",
      "Stencil vinyl (for etching / painting)",
    ],
  },
];

export const ALL_ITEMS = [AI_PICKS, ...ITEM_GROUPS.flatMap((g) => g.items)];
export const ALL_VINYLS = [AI_RECOMMENDS, ...VINYL_GROUPS.flatMap((g) => g.items)];

// Sample recipients for the "Surprise me" button.
export const SAMPLE_RECIPIENTS = [
  "My sister who loves coffee, true crime podcasts, and her golden retriever",
  "A 5th grade teacher who is obsessed with sunflowers",
  "My dad who fishes every weekend and loves bad puns",
  "A bride-to-be who loves the beach and margaritas",
  "A new mom who is running on iced coffee and zero sleep",
  "My best friend who loves plants, cats, and yoga",
  "A high school senior headed to nursing school",
  "A local bakery owner who wants cute branding",
  "My grandma who loves gardening, hummingbirds, and Jesus",
  "A softball team of 12-year-old girls called the Lightning",
  "A couple who just bought their first farmhouse",
  "My nephew who is obsessed with dinosaurs and turning 4",
];

export type SparkForm = {
  occasion: string;
  recipient: string;
  vibe: string;
  item: string;
  vinyl: string;
  budget: string;
  quantity: string;
};

export const EMPTY_FORM: SparkForm = {
  occasion: OCCASIONS[0],
  recipient: "",
  vibe: VIBES[0],
  item: AI_PICKS,
  vinyl: AI_RECOMMENDS,
  budget: "15",
  quantity: "1",
};

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function randomForm(): SparkForm {
  return {
    occasion: pick(OCCASIONS),
    recipient: pick(SAMPLE_RECIPIENTS),
    vibe: pick(VIBES),
    // Lean toward letting the AI choose sometimes, for extra surprise.
    item: Math.random() < 0.25 ? AI_PICKS : pick(ALL_ITEMS.slice(1)),
    vinyl: Math.random() < 0.6 ? AI_RECOMMENDS : pick(ALL_VINYLS.slice(1)),
    budget: String(pick([5, 10, 15, 20, 25, 35, 50])),
    quantity: String(pick([1, 1, 2, 5, 10, 12, 24])),
  };
}
