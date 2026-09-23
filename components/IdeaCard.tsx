"use client";

import { useMemo, useState } from "react";
import type { Idea } from "@/lib/ideas";
import { downloadSvg, googleSearchUrl, sanitizeSvg, svgToDataUrl } from "@/lib/svg";
import LoadingMessages from "./LoadingMessages";

// Each card gets its own pastel color theme.
const THEMES = [
  { card: "bg-bubblegum/40 border-bubblegum", chip: "bg-bubblegum", accent: "text-[#c2417a]" },
  { card: "bg-mint/50 border-mint", chip: "bg-mint", accent: "text-[#23835c]" },
  { card: "bg-sky/50 border-sky", chip: "bg-sky", accent: "text-[#2c6ea6]" },
  { card: "bg-peach/50 border-peach", chip: "bg-peach", accent: "text-[#b25a1c]" },
  { card: "bg-lilac/50 border-lilac", chip: "bg-lilac", accent: "text-grape" },
];

const DIFFICULTY = {
  easy: "🟢 Easy",
  medium: "🟡 Medium",
  hard: "🔴 Hard",
} as const;

export function ideaToText(idea: Idea): string {
  return [
    `✨ ${idea.name}`,
    ``,
    `Item: ${idea.item}`,
    `Vinyl: ${idea.vinylType} — ${idea.vinylReason}`,
    `Phrase: "${idea.phrase}"`,
    `Design: ${idea.designConcept}`,
    `Fonts: ${idea.fonts.join(" | ")}`,
    ``,
    `Materials:`,
    ...idea.materials.map((m) => `• ${m}`),
    ``,
    `Application tips:`,
    ...idea.applicationTips.map((t) => `• ${t}`),
    `Care: ${idea.careInstructions}`,
    ``,
    `Difficulty: ${idea.difficulty} | Time: ${idea.estimatedTime}`,
    `Material cost: ${idea.estimatedMaterialCost} | Suggested price: ${idea.suggestedPrice}`,
    `SVG search keywords: ${idea.svgKeywords.join(", ")}`,
  ].join("\n");
}

type Props = {
  idea: Idea;
  themeIndex: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
};

export default function IdeaCard({
  idea,
  themeIndex,
  isFavorite,
  onToggleFavorite,
  onRegenerate,
  regenerating = false,
}: Props) {
  const theme = THEMES[themeIndex % THEMES.length];
  const [copied, setCopied] = useState(false);

  // Clean the SVG before we show it or let anyone download it.
  const safeSvg = useMemo(() => sanitizeSvg(idea.svg), [idea.svg]);
  const keywords = idea.svgKeywords.join(" ");

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(ideaToText(idea));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("Couldn't copy automatically — try selecting the text instead.");
    }
  };

  return (
    <article
      className={`animate-pop-in relative flex flex-col gap-4 rounded-[2rem] border-4 p-5 shadow-lg sm:p-6 ${theme.card} ${
        regenerating ? "opacity-70" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl font-bold leading-tight">{idea.name}</h3>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Save favorite"}
          title={isFavorite ? "Remove from favorites" : "Save favorite"}
          className="shrink-0 rounded-full bg-white/80 p-2 text-2xl leading-none shadow transition hover:scale-110"
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <span className={`rounded-full px-3 py-1 ${theme.chip}`}>{idea.item}</span>
        <span className="rounded-full bg-white/80 px-3 py-1">{DIFFICULTY[idea.difficulty]}</span>
        <span className="rounded-full bg-white/80 px-3 py-1">⏱ {idea.estimatedTime}</span>
      </div>

      {/* SVG preview */}
      <div className="rounded-3xl bg-white p-4 shadow-inner">
        {safeSvg ? (
          // Showing it as an image means nothing inside the SVG can ever run.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={svgToDataUrl(safeSvg)}
            alt={`Starter design: ${idea.phrase}`}
            className="mx-auto h-48 w-full object-contain"
          />
        ) : (
          <p className="py-10 text-center text-sm text-ink/60">No preview available for this one — try the search buttons below!</p>
        )}
      </div>

      <div>
        <p className={`font-display text-lg font-semibold ${theme.accent}`}>“{idea.phrase}”</p>
        <p className="mt-1 text-[0.95rem]">{idea.designConcept}</p>
      </div>

      <dl className="grid gap-3 text-[0.95rem]">
        <div>
          <dt className="font-bold">🧵 Vinyl</dt>
          <dd>
            <span className="font-semibold">{idea.vinylType}</span> — {idea.vinylReason}
          </dd>
        </div>
        <div>
          <dt className="font-bold">🔤 Font styles</dt>
          <dd className="mt-1 flex flex-wrap gap-1.5">
            {idea.fonts.map((f) => (
              <span key={f} className="rounded-full bg-white/80 px-2.5 py-0.5 text-sm">
                {f}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt className="font-bold">🧰 Materials</dt>
          <dd>
            <ul className="ml-5 list-disc">
              {idea.materials.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="font-bold">💡 Application tips</dt>
          <dd>
            <ul className="ml-5 list-disc">
              {idea.applicationTips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="font-bold">🧼 Care</dt>
          <dd>{idea.careInstructions}</dd>
        </div>
      </dl>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-2xl bg-white/80 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/60">Material cost</p>
          <p className="font-display text-xl font-semibold">{idea.estimatedMaterialCost}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/60">Sell for</p>
          <p className="font-display text-xl font-semibold">{idea.suggestedPrice}</p>
        </div>
      </div>

      {/* SVG buttons */}
      <div className="rounded-3xl bg-white/70 p-4">
        <p className="mb-2 text-sm">
          <span className="font-bold">SVG keywords:</span> {idea.svgKeywords.join(", ")}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={!safeSvg}
            onClick={() => downloadSvg(safeSvg, idea.name)}
            className="rounded-full bg-ink px-4 py-2.5 font-semibold text-white transition hover:bg-ink/85 disabled:opacity-40"
          >
            ⬇️ Download SVG
          </button>
          <div className="grid gap-2">
            <a
              href={googleSearchUrl(`free svg ${keywords}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-center text-sm font-semibold transition hover:border-grape"
            >
              🔍 Find free SVGs
            </a>
            <a
              href={googleSearchUrl(`free svg commercial use ${keywords}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-center text-sm font-semibold transition hover:border-grape"
            >
              💼 Free for commercial use
            </a>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink/70">
          Check each file&apos;s license — many free SVGs are personal use only. Look for
          &apos;commercial use&apos; if you plan to sell.
        </p>
      </div>

      {/* Card actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyDetails}
          className="flex-1 rounded-full bg-white px-4 py-2.5 font-semibold shadow transition hover:-translate-y-0.5"
        >
          {copied ? "✅ Copied!" : "📋 Copy details"}
        </button>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating}
            className="flex-1 rounded-full bg-white px-4 py-2.5 font-semibold shadow transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
          >
            🔄 Regenerate this idea
          </button>
        )}
      </div>
      {regenerating && <LoadingMessages compact />}
    </article>
  );
}
