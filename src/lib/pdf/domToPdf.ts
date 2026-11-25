"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/* ------------------------------------------------------------------ */
/* Remote images → data URLs (avoids CORS-tainted / missing images)    */
/* ------------------------------------------------------------------ */

const isRemoteUrl = (src: string) =>
  /^https?:\/\//i.test(src) && !src.startsWith(window.location.origin);

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });

/** Renders an SVG data URL to a PNG data URL, at least `minWidth` px wide. */
const svgDataUrlToPng = async (src: string, minWidth = 640): Promise<string | null> => {
  try {
    const img = await loadImage(src);
    const w0 = img.naturalWidth || 300;
    const h0 = img.naturalHeight || 150;
    const k = Math.max(1, minWidth / w0);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w0 * k);
    canvas.height = Math.round(h0 * k);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
};

const inlinedImageCache = new Map<string, string>();

/** Loads a remote image as a data URL via same-origin routes; null if every route fails. */
export const inlineImage = async (src: string): Promise<string | null> => {
  const cached = inlinedImageCache.get(src);
  if (cached) return cached;
  const candidates = [
    `/api/image-proxy?url=${encodeURIComponent(src)}`,
    `/_next/image?url=${encodeURIComponent(src)}&w=828&q=85`,
    src,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) continue;
      let data = await blobToDataUrl(blob);
      // SVGs without a fixed size (e.g. flagcdn flags) are cropped by
      // html2canvas — hand it a PNG instead.
      if (blob.type.includes("svg")) data = (await svgDataUrlToPng(data)) ?? data;
      inlinedImageCache.set(src, data);
      return data;
    } catch {
      // try the next candidate
    }
  }
  return null;
};

/** Collects every remote <img> src under the given roots and inlines them. */
const inlineRemoteImages = async (roots: HTMLElement[]) => {
  const srcs = new Set<string>();
  roots.forEach((root) =>
    root.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (isRemoteUrl(src)) srcs.add(src);
    })
  );
  const inlined = new Map<string, string>();
  await Promise.all(
    [...srcs].map(async (src) => {
      const data = await inlineImage(src);
      if (data) inlined.set(src, data);
    })
  );
  return inlined;
};

/* ------------------------------------------------------------------ */
/* Complex SVGs (badge) → PNG, drawn by the browser itself              */
/* ------------------------------------------------------------------ */

const RASTER_ATTR = "data-pdf-raster-id";

/** The 1×1 gif html2canvas (1.4.x) uses to measure font baselines. */
const HTML2CANVAS_PROBE_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * html2canvas re-renders inline SVGs itself and gets large, gradient/filter
 * heavy ones wrong (wrong size, cropped). `svg[data-pdf-rasterize]` elements
 * are instead rendered by the browser at 2× their viewBox and swapped in as
 * PNGs. Independent of the live layout, so it works even if the element is
 * hidden at the current screen width.
 */
const rasterizeSvgs = async (roots: HTMLElement[]) => {
  const out = new Map<string, string>();
  const svgs = roots.flatMap((root) =>
    Array.from(root.querySelectorAll<SVGSVGElement>("svg[data-pdf-rasterize]"))
  );
  await Promise.all(
    svgs.map(async (svg, i) => {
      const id = `svg-${i}`;
      svg.setAttribute(RASTER_ATTR, id);
      const vb = svg.viewBox?.baseVal;
      const rect = svg.getBoundingClientRect();
      const w = vb?.width || rect.width || 800;
      const h = vb?.height || rect.height || 800;
      const scale = 2;

      const copy = svg.cloneNode(true) as SVGSVGElement;
      copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      copy.setAttribute("width", String(w * scale));
      copy.setAttribute("height", String(h * scale));
      const xml = new XMLSerializer().serializeToString(copy);
      const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;

      try {
        const img = await loadImage(src);
        const canvas = document.createElement("canvas");
        canvas.width = w * scale;
        canvas.height = h * scale;
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        out.set(id, canvas.toDataURL("image/png"));
      } catch {
        // fall back to html2canvas' own SVG rendering
      }
    })
  );
  const cleanup = () => svgs.forEach((svg) => svg.removeAttribute(RASTER_ATTR));
  return { rasters: out, cleanup };
};

/* ------------------------------------------------------------------ */
/* html2canvas can't parse oklch()/lab() colours that Tailwind v4 uses  */
/* ------------------------------------------------------------------ */

const withModernColorShim = async <T,>(fn: () => Promise<T>): Promise<T> => {
  const originalGetComputedStyle = window.getComputedStyle;
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = 1;
  colorCanvas.height = 1;
  const ctx = colorCanvas.getContext("2d", { willReadFrequently: true });
  const cache = new Map<string, string>();

  const toRgba = (color: string) => {
    const hit = cache.get(color);
    if (hit) return hit;
    let result = "rgba(0, 0, 0, 0)";
    if (ctx) {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      result = `rgba(${r}, ${g}, ${b}, ${Number((a / 255).toFixed(3))})`;
    }
    cache.set(color, result);
    return result;
  };

  const convert = (value: string) =>
    /(oklch|oklab|lab|lch)\(/.test(value)
      ? value.replace(/(oklch|oklab|lab|lch)\([^)]+\)/g, (m) => {
          try {
            return toRgba(m);
          } catch {
            return "rgba(0, 0, 0, 0)";
          }
        })
      : value;

  window.getComputedStyle = function (el, pseudoEl) {
    const style = originalGetComputedStyle(el, pseudoEl);
    return new Proxy(style, {
      get(target, prop) {
        if (prop === "getPropertyValue") {
          return (name: string) => convert(target.getPropertyValue(name));
        }
        const value = (target as unknown as Record<string | symbol, unknown>)[prop];
        if (typeof value === "string") return convert(value);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        if (typeof value === "function") return (value as Function).bind(target);
        return value;
      },
    });
  };

  try {
    return await fn();
  } finally {
    window.getComputedStyle = originalGetComputedStyle;
  }
};

/* ------------------------------------------------------------------ */
/* Export: one DOM element → exactly one A4 page                        */
/* ------------------------------------------------------------------ */

export interface DomPagesToPdfOptions {
  /** One element per PDF page, in order. */
  pages: HTMLElement[];
  fileName: string;
  /** Page background (also used behind content). */
  backgroundColor?: string;
  /**
   * Viewport width used to lay out the capture. Defaults to the live page's
   * content width: html2canvas crops using the element's *live* position and
   * size, so laying the copy out at any other width shifts/crops full-width
   * sections.
   */
  windowWidth?: number;
  /** Page margin in mm. */
  marginMm?: number;
  /** Optional footer text per page, e.g. (i, n) => `Page ${i} of ${n}`. */
  footer?: (pageNumber: number, pageCount: number) => string;
}

const PAGE_WIDTH_MM = 210;

/**
 * Captures each element as it looks on screen and places it on its own page
 * (A4 width, height following the content — never split, never shrunk).
 *
 * In the captured copy:
 *  - `[data-pdf-hide]` and `.print:hidden` elements are hidden (space kept);
 *  - `[data-pdf-row="N"]` containers show only their first N children in a
 *    single row of N columns.
 */
export const domPagesToPdf = async ({
  pages,
  fileName,
  backgroundColor = "#0a0a0a",
  windowWidth,
  marginMm = 6,
  footer,
}: DomPagesToPdfOptions) => {
  if (document.fonts?.ready) await document.fonts.ready;
  const inlined = await inlineRemoteImages(pages);
  const { rasters, cleanup: cleanupRasters } = await rasterizeSvgs(pages);

  // html2canvas finds each font's baseline with a 1×1 <img> probe appended to
  // the *live* document. Tailwind's preflight makes every img `display:block`,
  // which breaks the probe and draws all text too low (labels sinking under
  // bars, badge text off-centre, clipped descenders). Restore the probe to
  // inline while capturing.
  const probeFix = document.createElement("style");
  probeFix.textContent = `body > div > img[src="${HTML2CANVAS_PROBE_IMAGE}"]{display:inline!important;}`;
  document.head.appendChild(probeFix);
  const cleanup = () => {
    probeFix.remove();
    cleanupRasters();
  };

  const canvases = await withModernColorShim(async () => {
    const out: HTMLCanvasElement[] = [];
    for (const page of pages) {
      // Sequential on purpose: html2canvas clones the whole document per call.
      out.push(
        await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor,
          logging: false,
          windowWidth: windowWidth ?? document.documentElement.clientWidth,
          onclone: (clonedDoc) => {
            clonedDoc.querySelectorAll("img").forEach((img) => {
              const data = inlined.get(img.getAttribute("src") || "");
              if (data) {
                img.removeAttribute("srcset");
                img.src = data;
              }
            });
            // Hidden, not removed, so surrounding layout (e.g. centred headers) stays put.
            clonedDoc
              .querySelectorAll<HTMLElement>("[data-pdf-hide], .print\\:hidden")
              .forEach((el) => {
                el.style.visibility = "hidden";
              });
            clonedDoc.querySelectorAll<HTMLElement>("[data-pdf-row]").forEach((row) => {
              const limit = Math.max(1, Number(row.dataset.pdfRow) || 3);
              row.style.display = "grid";
              row.style.gridTemplateColumns = `repeat(${limit}, minmax(0, 1fr))`;
              Array.from(row.children).forEach((child, i) => {
                if (i >= limit) child.remove();
              });
            });
            // A PDF can't be hovered/expanded, so instead of cutting labels to
            // "…" (or letting them spill into the next column) let truncated
            // text wrap onto another line inside its own box.
            clonedDoc.querySelectorAll<HTMLElement>(".truncate, .line-clamp-1, .line-clamp-2").forEach((el) => {
              el.style.whiteSpace = "normal";
              el.style.overflow = "visible";
              el.style.textOverflow = "clip";
              el.style.overflowWrap = "break-word";
              el.style.webkitLineClamp = "unset";
            });
            // Pre-rendered SVGs (badge) are swapped for their PNG, filling the
            // same box the SVG occupied.
            clonedDoc.querySelectorAll<SVGSVGElement>(`svg[${RASTER_ATTR}]`).forEach((svg) => {
              const data = rasters.get(svg.getAttribute(RASTER_ATTR) || "");
              if (!data) return;
              const img = clonedDoc.createElement("img");
              img.src = data;
              img.alt = "";
              img.style.display = "block";
              img.style.width = "100%";
              img.style.height = "100%";
              img.style.objectFit = "contain";
              svg.replaceWith(img);
            });
            // Other inline SVGs sized with "100%" are re-rasterised at the wrong
            // size. Pin them to their laid-out pixel size.
            clonedDoc.querySelectorAll<SVGSVGElement>("svg").forEach((svg) => {
              const rect = svg.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                svg.setAttribute("width", String(Math.round(rect.width)));
                svg.setAttribute("height", String(Math.round(rect.height)));
              }
            });
            // Hover/entrance animations would otherwise be captured mid-way.
            const style = clonedDoc.createElement("style");
            style.textContent =
              "*,*::before,*::after{animation:none!important;transition:none!important;}";
            clonedDoc.head.appendChild(style);
          },
        })
      );
    }
    return out;
  }).finally(cleanup);

  // Every page is A4 width and as tall as its content: the capture always
  // fills the full width (no shrinking, no side gutters) and is never split.
  const pageW = PAGE_WIDTH_MM;
  const footerSpace = footer ? 8 : 0;
  const contentW = pageW - marginMm * 2;
  const sizes = canvases.map((canvas) => {
    const h = (canvas.height * contentW) / canvas.width;
    return { h, pageH: h + marginMm * 2 + footerSpace };
  });

  // jsPDF swaps width/height to match the orientation, so a page shorter than
  // it is wide must be "l" — forcing "p" made those pages narrow (content cut
  // off on the right) with an unpainted white strip at the bottom.
  const orientationFor = (pageH: number) => (pageH >= pageW ? "p" : "l");
  const firstH = sizes[0]?.pageH ?? 297;
  const pdf = new jsPDF({ unit: "mm", format: [pageW, firstH], orientation: orientationFor(firstH) });

  canvases.forEach((canvas, i) => {
    const { h, pageH } = sizes[i];
    if (i > 0) pdf.addPage([pageW, pageH], orientationFor(pageH));
    pdf.setFillColor(backgroundColor);
    pdf.rect(0, 0, pageW, pageH, "F");
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", marginMm, marginMm, contentW, h);

    if (footer) {
      pdf.setFontSize(9);
      pdf.setTextColor(150);
      pdf.text(footer(i + 1, canvases.length), pageW / 2, pageH - marginMm / 2 - 1, { align: "center" });
    }
  });

  pdf.save(fileName);
};
