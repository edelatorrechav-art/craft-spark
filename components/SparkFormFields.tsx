"use client";

import {
  AI_PICKS,
  AI_RECOMMENDS,
  ITEM_GROUPS,
  OCCASIONS,
  VIBES,
  VINYL_GROUPS,
  type SparkForm,
} from "@/lib/options";

type Props = {
  form: SparkForm;
  onChange: (form: SparkForm) => void;
  onSubmit: () => void;
  onSurprise: () => void;
  loading: boolean;
};

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-display text-sm font-semibold text-grape">
      {children}
    </label>
  );
}

export default function SparkFormFields({ form, onChange, onSubmit, onSurprise, loading }: Props) {
  const set = (key: keyof SparkForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ ...form, [key]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-[2rem] border-4 border-white bg-white/80 p-5 shadow-xl shadow-lilac/60 backdrop-blur sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="occasion">🎉 Occasion</Label>
          <select id="occasion" className="field" value={form.occasion} onChange={set("occasion")}>
            {OCCASIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="vibe">💖 Vibe</Label>
          <select id="vibe" className="field" value={form.vibe} onChange={set("vibe")}>
            {VIBES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="recipient">🎁 Who it&apos;s for + their interests</Label>
          <textarea
            id="recipient"
            className="field min-h-20 resize-y"
            maxLength={500}
            placeholder="e.g. My sister who loves coffee, true crime podcasts, and her golden retriever"
            value={form.recipient}
            onChange={set("recipient")}
          />
        </div>

        <div>
          <Label htmlFor="item">☕ Item</Label>
          <select id="item" className="field" value={form.item} onChange={set("item")}>
            <option value={AI_PICKS}>✨ AI picks for me</option>
            {ITEM_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="vinyl">🧵 Vinyl type</Label>
          <select id="vinyl" className="field" value={form.vinyl} onChange={set("vinyl")}>
            <option value={AI_RECOMMENDS}>✨ AI recommends</option>
            {VINYL_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="budget">💵 Budget per item ($)</Label>
          <input
            id="budget"
            className="field"
            type="number"
            min={0}
            step="1"
            inputMode="decimal"
            value={form.budget}
            onChange={set("budget")}
          />
        </div>

        <div>
          <Label htmlFor="quantity">🔢 Quantity</Label>
          <input
            id="quantity"
            className="field"
            type="number"
            min={1}
            step="1"
            inputMode="numeric"
            value={form.quantity}
            onChange={set("quantity")}
          />
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-full bg-grape px-6 py-3.5 font-display text-lg font-semibold text-white shadow-lg shadow-grape/30 transition hover:-translate-y-0.5 hover:bg-[#6a4aad] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? "Sparking..." : "✨ Spark Ideas"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onSurprise}
          className="rounded-full border-2 border-grape/20 bg-lemon px-6 py-3.5 font-display text-lg font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-[#ffec80] disabled:opacity-60"
        >
          🎲 Surprise me
        </button>
      </div>
    </form>
  );
}
