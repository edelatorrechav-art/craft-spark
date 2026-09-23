"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Weeding the vinyl...",
  "Warming up the heat press...",
  "Finding the perfect font...",
  "Peeling back the transfer tape...",
  "Sharpening the fine-point blade...",
  "Sorting the glitter HTV...",
  "Mirroring the design (just in case!)...",
  "Lint-rolling the t-shirt...",
  "Counting the tumblers...",
  "Squeegeeing out the bubbles...",
];

export default function LoadingMessages({ compact = false }: { compact?: boolean }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * MESSAGES.length));

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 1800);
    return () => clearInterval(timer);
  }, []);

  if (compact) {
    return (
      <p role="status" className="text-sm font-semibold text-grape">
        <span className="mr-2 inline-block animate-wiggle">✂️</span>
        {MESSAGES[index]}
      </p>
    );
  }

  return (
    <div role="status" className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="text-5xl animate-wiggle" aria-hidden>
        ✂️
      </div>
      <p className="font-display text-xl font-semibold text-grape">{MESSAGES[index]}</p>
      <p className="text-sm text-ink/60">Cooking up 3 fresh ideas — this takes about 15–30 seconds.</p>
    </div>
  );
}
