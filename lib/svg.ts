// Safety tools for the AI-made SVG artwork, plus helpers for downloads.

// Tags that are safe for simple, cut-friendly artwork. Anything else
// (script, foreignObject, image, animate, use, iframe...) gets removed.
const ALLOWED_TAGS = new Set([
  "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline",
  "polygon", "text", "tspan", "title", "desc", "defs",
]);

const ALLOWED_ATTRS = new Set([
  "xmlns", "viewbox", "width", "height", "x", "y", "x1", "y1", "x2", "y2",
  "cx", "cy", "r", "rx", "ry", "d", "points", "fill", "fill-rule",
  "clip-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
  "stroke-miterlimit", "transform", "font-family", "font-size",
  "font-weight", "font-style", "text-anchor", "dominant-baseline",
  "letter-spacing", "dx", "dy", "opacity", "preserveaspectratio", "id",
]);

// Quick first pass that works anywhere (server or browser): removes the
// obviously dangerous bits with plain text matching.
export function roughCleanSvg(raw: string): string {
  let svg = raw.trim();
  // Keep only the <svg>...</svg> part, in case the AI added extra text.
  const start = svg.search(/<svg[\s>]/i);
  const end = svg.toLowerCase().lastIndexOf("</svg>");
  if (start === -1 || end === -1) return "";
  svg = svg.slice(start, end + 6);

  return svg
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<script[^>]*\/?>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/<style[\s\S]*?<\/style\s*>/gi, "")
    .replace(/\s(on[a-z]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(xlink:)?href\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

// Thorough pass for the browser: parses the SVG and keeps only tags and
// attributes from the allow-lists above. Returns "" if it isn't valid SVG.
export function sanitizeSvg(raw: string): string {
  const rough = roughCleanSvg(raw);
  if (!rough || typeof window === "undefined") return rough;

  const doc = new DOMParser().parseFromString(rough, "image/svg+xml");
  const root = doc.documentElement;
  if (root.nodeName.toLowerCase() !== "svg" || doc.querySelector("parsererror")) {
    return "";
  }

  const clean = (el: Element) => {
    for (const child of Array.from(el.children)) {
      if (!ALLOWED_TAGS.has(child.nodeName.toLowerCase())) {
        child.remove();
      } else {
        clean(child);
      }
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.toLowerCase();
      if (
        !ALLOWED_ATTRS.has(name) ||
        value.includes("javascript:") ||
        value.includes("url(")
      ) {
        el.removeAttribute(attr.name);
      }
    }
  };
  clean(root);

  root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (!root.getAttribute("viewBox")) root.setAttribute("viewBox", "0 0 400 400");

  return new XMLSerializer().serializeToString(root);
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// "Mama's Coffee Club!" -> "mamas-coffee-club"
export function toFileName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "craft-spark-design"}.svg`;
}

export function downloadSvg(svg: string, projectName: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = toFileName(projectName);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Google searches are built here by the app — never by the AI.
export function googleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
