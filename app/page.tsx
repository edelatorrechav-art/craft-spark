"use client";

import { useEffect, useState } from "react";
import IdeaCard from "@/components/IdeaCard";
import LoadingMessages from "@/components/LoadingMessages";
import SparkFormFields from "@/components/SparkFormFields";
import type { Idea } from "@/lib/ideas";
import { EMPTY_FORM, randomForm, type SparkForm } from "@/lib/options";

const FAVORITES_KEY = "craft-spark-favorites";

// A simple ID so we can tell ideas apart for favorites.
const ideaKey = (idea: Idea) => `${idea.name}::${idea.phrase}`;

async function fetchIdeas(body: object): Promise<Idea[]> {
  const res = await fetch("/api/ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ideas) {
    throw new Error(data?.error ?? "Something went wrong. Please try again.");
  }
  return data.ideas;
}

export default function Home() {
  const [form, setForm] = useState<SparkForm>(EMPTY_FORM);
  // The form as it was when the current ideas were made (used by "Regenerate").
  const [lastForm, setLastForm] = useState<SparkForm | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Idea[]>([]);

  // Favorites last for this browser tab session (they survive a refresh).
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(FAVORITES_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- load once after mount
      if (saved) setFavorites(JSON.parse(saved));
    } catch {
      /* storage unavailable — favorites just won't survive a refresh */
    }
  }, []);

  const saveFavorites = (next: Idea[]) => {
    setFavorites(next);
    try {
      sessionStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const isFavorite = (idea: Idea) => favorites.some((f) => ideaKey(f) === ideaKey(idea));

  const toggleFavorite = (idea: Idea) => {
    saveFavorites(
      isFavorite(idea)
        ? favorites.filter((f) => ideaKey(f) !== ideaKey(idea))
        : [...favorites, idea],
    );
  };

  const sparkIdeas = async () => {
    setLoading(true);
    setError(null);
    setIdeas([]);
    try {
      const result = await fetchIdeas({ ...form, count: 3 });
      setIdeas(result);
      setLastForm(form);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async (index: number) => {
    if (!lastForm) return;
    setRegenerating(index);
    setError(null);
    try {
      const [fresh] = await fetchIdeas({
        ...lastForm,
        count: 1,
        avoid: ideas.map((i) => `${i.name} ("${i.phrase}")`),
      });
      setIdeas((current) => current.map((idea, i) => (i === index ? fresh : idea)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRegenerating(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <p className="mb-2 text-4xl" aria-hidden>
          ✂️✨💜
        </p>
        <h1 className="font-display text-5xl font-bold text-grape sm:text-6xl">Craft Spark</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg">
          Custom vinyl project ideas, starter SVGs, and pricing tips for your Cricut creations.
        </p>
      </header>

      <section className="mx-auto max-w-3xl">
        <SparkFormFields
          form={form}
          onChange={setForm}
          onSubmit={sparkIdeas}
          onSurprise={() => setForm(randomForm())}
          loading={loading}
        />
      </section>

      {error && (
        <div
          role="alert"
          className="mx-auto mt-6 max-w-3xl rounded-3xl border-4 border-peach bg-white p-5 text-center"
        >
          <p className="font-display text-xl font-semibold">🧷 Oops, the vinyl got tangled!</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {loading && <LoadingMessages />}

      {ideas.length > 0 && (
        <section className="mt-10" aria-label="Project ideas">
          <h2 className="mb-5 text-center font-display text-3xl font-bold">Your Spark Ideas ✨</h2>
          <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea, i) => (
              <IdeaCard
                key={ideaKey(idea) + i}
                idea={idea}
                themeIndex={i}
                isFavorite={isFavorite(idea)}
                onToggleFavorite={() => toggleFavorite(idea)}
                onRegenerate={() => regenerate(i)}
                regenerating={regenerating === i}
              />
            ))}
          </div>
        </section>
      )}

      {favorites.length > 0 && (
        <section className="mt-14" aria-label="Favorites">
          <h2 className="mb-5 text-center font-display text-3xl font-bold">❤️ Your Favorites</h2>
          <div className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((idea, i) => (
              <IdeaCard
                key={ideaKey(idea)}
                idea={idea}
                themeIndex={i + 3}
                isFavorite
                onToggleFavorite={() => toggleFavorite(idea)}
              />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-16 text-center text-sm text-ink/60">
        Made with 💜 and a lot of transfer tape. Ideas are AI-generated — always test on a spare blank first!
      </footer>
    </main>
  );
}
