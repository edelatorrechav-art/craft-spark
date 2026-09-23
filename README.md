# ✂️ Craft Spark

A playful web app for Cricut crafters. Fill in the occasion, who it's for, the vibe, the item, and the vinyl, then click **Spark Ideas**. You get 3 project ideas, each with:

- vinyl advice
- a phrase and design concept
- font suggestions
- a materials list
- application and care tips
- pricing
- a starter SVG you can download

Built with Next.js (App Router) and Tailwind CSS, and uses Claude (Anthropic) for the ideas. It's meant to be deployed on Vercel.

## What each file does

| File | In plain English |
| --- | --- |
| `app/page.tsx` | **The main page.** Holds the form, the idea cards, the favorites section, and the error message. When you click Spark Ideas, it sends your choices to the server and shows the cards that come back. |
| `app/api/ideas/route.ts` | **The server "kitchen".** Receives the form, writes the instructions for the AI, calls Claude with your secret API key, checks the answer, removes any web addresses and unsafe SVG bits, and sends back clean ideas. This code runs only on the server, so your key never reaches visitors' browsers. |
| `components/SparkFormFields.tsx` | The form: all the dropdowns, text boxes, and the **Spark Ideas** and **Surprise me** buttons. |
| `components/IdeaCard.tsx` | One colorful idea card: the SVG preview, the details, the Download SVG, Find free SVGs, Copy details and Regenerate buttons, and the heart. |
| `components/LoadingMessages.tsx` | The rotating "Weeding the vinyl..." messages shown while the AI works. |
| `lib/options.ts` | Every dropdown choice (occasions, vibes, items, vinyl types) and the random picks for **Surprise me**. Edit this file to add or rename choices. |
| `lib/ideas.ts` | The "shape" of one idea (name, phrase, materials, and so on). The AI must answer in exactly this shape, which is why each idea can become its own card. |
| `lib/svg.ts` | SVG safety and helpers. Strips scripts, event handlers, links and anything that isn't plain shapes or text. Also builds the download file name and the Google search links. |
| `app/layout.tsx` | The page wrapper that loads the fun fonts (Fredoka for headings, Nunito for text). |
| `app/globals.css` | The pastel color palette, the confetti-dot background, and the little animations. |
| `.env.example` | A template that shows which secret the app needs (`ANTHROPIC_API_KEY`). |
| `package.json` | The list of building blocks the app uses and the commands to run it. |
| `AGENTS.md` / `CLAUDE.md` | Notes for AI coding assistants. You can ignore these. |

## Try it on your computer (optional)

1. Install [Node.js](https://nodejs.org) (the LTS version).
2. In this folder, run `npm install`.
3. Copy `.env.example` to a new file called `.env.local`, then paste your key after `ANTHROPIC_API_KEY=`.
4. Run `npm run dev`, then open http://localhost:3000.

## Deploy to Vercel

See the step-by-step guide in the chat, or follow these steps:

1. Get an API key at https://console.anthropic.com → **API Keys** → **Create Key**. Copy it and keep it private.
2. Go to https://vercel.com, sign in with GitHub, then click **Add New… → Project**.
3. Import the `craft-spark` repository. Vercel detects Next.js on its own.
4. Before clicking Deploy, open **Environment Variables** and add:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your key
5. Click **Deploy**. After a minute or so, you get a live link.

If you add or change the key later, go to **Settings → Environment Variables**. Then open the **Deployments** tab, click **⋯** on the latest deployment, and choose **Redeploy**. The new key only takes effect after a redeploy.
