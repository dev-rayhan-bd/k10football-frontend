/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Browser-safe AI Background Removal Utility
 *
 * Loads @imgly/background-removal natively in the browser via ESM CDN (bypassing Next.js 16 /
 * Turbopack bundling of onnxruntime-web, which otherwise breaks dynamic WASM blob imports).
 *
 * - For club logos (isLogo = true): runs ISNet AI segmentation to strip ANY background
 *   (solid, colored, gradient, checkerboard, photo) and auto-trims transparent padding.
 *   Falls back to canvas edge flood-fill only if offline/CDN fails.
 * - For FIFA card & player portraits (isLogo = false): runs ISNet AI segmentation
 *   producing a crisp transparent PNG cutout.
 */

export type BgRemovalProgressCallback = (percent: number, stage: string) => void;

let cachedRemoveBackgroundFn: any = null;

/**
 * Crops a canvas tightly around all non-transparent pixels (alpha > 15)
 * with a small breathing margin so logos render crisp and full-sized.
 */
function trimTransparentCanvas(sourceCanvas: HTMLCanvasElement, paddingRatio = 0.03): HTMLCanvasElement {
  const ctx = sourceCanvas.getContext("2d");
  if (!ctx) return sourceCanvas;

  const { width, height } = sourceCanvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 15) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return sourceCanvas;

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const pad = Math.max(2, Math.round(Math.max(contentW, contentH) * paddingRatio));

  const trimmed = document.createElement("canvas");
  trimmed.width = contentW + pad * 2;
  trimmed.height = contentH + pad * 2;
  const tCtx = trimmed.getContext("2d");
  if (!tCtx) return sourceCanvas;

  tCtx.drawImage(sourceCanvas, minX, minY, contentW, contentH, pad, pad, contentW, contentH);
  return trimmed;
}

/**
 * Auto-trims empty transparent padding from any PNG File.
 */
async function trimTransparentFile(file: File): Promise<File> {
  if (typeof window === "undefined") return file;

  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const trimmed = trimTransparentCanvas(canvas);
        trimmed.toBlob((blob) => {
          if (blob) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".png";
            resolve(new File([blob], cleanName, { type: "image/png" }));
          } else {
            resolve(file);
          }
        }, "image/png");
      } catch {
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Downscales very large images (e.g., 4K photos) to max 1024px on the longest side
 * before running WASM segmentation. ISNet runs at 1024x1024 internally,
 * so downscaling dramatically speeds up inference with zero quality loss.
 */
async function resizeImageForSegmentation(file: File, maxDim = 1024): Promise<Blob> {
  if (typeof window === "undefined") return file;

  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const { width, height } = img;
        if (width <= maxDim && height <= maxDim) {
          resolve(file);
          return;
        }
        const scale = maxDim / Math.max(width, height);
        const targetW = Math.round(width * scale);
        const targetH = Math.round(height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          "image/png"
        );
      } catch {
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Fallback solid background removal via edge flood-fill BFS on HTML5 Canvas.
 * Used only if AI background removal fails (e.g. offline/network error).
 */
export async function removeSolidBackground(file: File, tolerance = 45): Promise<File> {
  if (typeof window === "undefined") return file;

  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;

        const cornerIndices = [
          0,
          (w - 1) * 4,
          (h - 1) * w * 4,
          ((h - 1) * w + (w - 1)) * 4,
        ];

        let bgR = 0,
          bgG = 0,
          bgB = 0;
        cornerIndices.forEach((idx) => {
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);

        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        const colorDist = (pixelIdx: number) => {
          const i = pixelIdx * 4;
          return Math.max(
            Math.abs(data[i] - bgR),
            Math.abs(data[i + 1] - bgG),
            Math.abs(data[i + 2] - bgB)
          );
        };

        for (let x = 0; x < w; x++) {
          queue.push(x);
          queue.push((h - 1) * w + x);
        }
        for (let y = 1; y < h - 1; y++) {
          queue.push(y * w);
          queue.push(y * w + (w - 1));
        }

        const featherLimit = tolerance * 1.45;
        let head = 0;
        while (head < queue.length) {
          const p = queue[head++];
          if (visited[p]) continue;
          visited[p] = 1;

          const dist = colorDist(p);
          if (dist > featherLimit) continue;

          const i = p * 4;
          if (dist <= tolerance) {
            data[i + 3] = 0;
          } else {
            const factor = Math.min(1, Math.max(0, (dist - tolerance) / (featherLimit - tolerance)));
            data[i + 3] = Math.round(data[i + 3] * factor);
          }

          const x = p % w;
          const y = (p - x) / w;
          if (x > 0 && !visited[p - 1]) queue.push(p - 1);
          if (x < w - 1 && !visited[p + 1]) queue.push(p + 1);
          if (y > 0 && !visited[p - w]) queue.push(p - w);
          if (y < h - 1 && !visited[p + w]) queue.push(p + w);
        }

        ctx.putImageData(imgData, 0, 0);
        const trimmed = trimTransparentCanvas(canvas);
        trimmed.toBlob((blob) => {
          if (blob) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".png";
            resolve(new File([blob], cleanName, { type: "image/png" }));
          } else {
            resolve(file);
          }
        }, "image/png");
      } catch {
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Cleans the raw AI cutout of a person photo:
 *  1. Hardens the alpha mask — faint, half-sure pixels (blurred crowd, grass
 *     glow) are dropped, near-solid pixels become fully opaque.
 *  2. Keeps only the main subject: connected regions much smaller than the
 *     largest one (stray specks of background) are erased.
 *  3. Softens the outermost edge pixels so no coloured halo from the old
 *     background remains.
 */
function cleanSubjectMask(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const n = w * h;

  // 1. Harden alpha.
  const LOW = 120;
  const HIGH = 210;
  for (let p = 0; p < n; p++) {
    const i = p * 4 + 3;
    const a = d[i];
    d[i] = a <= LOW ? 0 : a >= HIGH ? 255 : Math.round(((a - LOW) / (HIGH - LOW)) * 255);
  }

  // 2. Connected components (4-neighbour) of visible pixels.
  const label = new Int32Array(n).fill(-1);
  const sizes: number[] = [];
  const stack: number[] = [];
  for (let start = 0; start < n; start++) {
    if (label[start] !== -1 || d[start * 4 + 3] === 0) continue;
    const id = sizes.length;
    let size = 0;
    label[start] = id;
    stack.push(start);
    while (stack.length) {
      const p = stack.pop()!;
      size++;
      const x = p % w;
      const neighbours = [
        x > 0 ? p - 1 : -1,
        x < w - 1 ? p + 1 : -1,
        p - w >= 0 ? p - w : -1,
        p + w < n ? p + w : -1,
      ];
      for (const q of neighbours) {
        if (q >= 0 && label[q] === -1 && d[q * 4 + 3] > 0) {
          label[q] = id;
          stack.push(q);
        }
      }
    }
    sizes.push(size);
  }
  if (sizes.length > 1) {
    const largest = Math.max(...sizes);
    const minKeep = largest * 0.08; // keep e.g. a separate ball, drop specks
    for (let p = 0; p < n; p++) {
      const id = label[p];
      if (id >= 0 && sizes[id] < minKeep) d[p * 4 + 3] = 0;
    }
  }

  // 3. Soften the 1px border of the subject (removes background-coloured halo).
  const alpha = new Uint8ClampedArray(n);
  for (let p = 0; p < n; p++) alpha[p] = d[p * 4 + 3];
  for (let p = 0; p < n; p++) {
    if (alpha[p] === 0) continue;
    const x = p % w;
    const touchesEmpty =
      (x > 0 && alpha[p - 1] === 0) ||
      (x < w - 1 && alpha[p + 1] === 0) ||
      (p - w >= 0 && alpha[p - w] === 0) ||
      (p + w < n && alpha[p + w] === 0);
    if (touchesEmpty) d[p * 4 + 3] = Math.min(alpha[p], 110);
  }

  ctx.putImageData(imgData, 0, 0);
}

/** Loads a Blob into a canvas. */
async function blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Failed to load cutout"));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d")?.drawImage(img, 0, 0);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const canvasToPngBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));

/**
 * Loads @imgly/background-removal natively in the browser via ESM CDN.
 * Intentionally avoids bundler-transformed imports because Next.js 16 Turbopack
 * breaks onnxruntime-web's default export and dynamic blob: WASM worker imports.
 */
async function loadRemoveBackgroundFn(): Promise<any> {
  if (cachedRemoveBackgroundFn) return cachedRemoveBackgroundFn;

  const importRuntime = new Function("url", "return import(url)");
  const cdnUrls = [
    "https://esm.sh/@imgly/background-removal@1.7.0",
    "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm",
  ];

  let lastError: unknown = null;
  for (const url of cdnUrls) {
    try {
      const mod = await importRuntime(url);
      const fn = mod?.removeBackground || mod?.default;
      if (typeof fn === "function") {
        cachedRemoveBackgroundFn = fn;
        return fn;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[BG Removal] Failed to load from ${url}:`, err);
    }
  }

  throw lastError || new Error("Could not load AI background removal module.");
}

/**
 * AI Background Removal using @imgly/background-removal (ISNet ONNX model).
 * Produces a clean transparent PNG cutout on any background.
 */
export async function removeBackgroundWithAI(
  file: File,
  onProgress?: BgRemovalProgressCallback
): Promise<File> {
  if (typeof window === "undefined") return file;

  onProgress?.(5, "Initializing AI model...");
  const removeBackground = await loadRemoveBackgroundFn();
  const inputBlob = await resizeImageForSegmentation(file, 1024);

  const blob: Blob = await removeBackground(inputBlob, {
    // fp16 gives noticeably cleaner edges than the 8-bit model on busy
    // backgrounds (stadium crowds, grass); downloaded once and cached.
    model: "isnet_fp16",
    device: "cpu",
    publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/",
    output: {
      format: "image/png",
      quality: 0.9,
    },
    progress: (key: string, current: number, total: number) => {
      if (!onProgress || !total) return;
      const ratio = Math.min(1, Math.max(0, current / total));
      if (key.startsWith("fetch:")) {
        onProgress(Math.round(5 + ratio * 70), "Downloading AI model...");
      } else if (key.startsWith("compute:")) {
        onProgress(Math.round(75 + ratio * 23), "Removing background...");
      }
    },
  });

  if (!blob || blob.size === 0) {
    throw new Error("AI background removal returned an empty image.");
  }

  onProgress?.(100, "Done!");
  const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".png";
  return new File([blob], cleanName, { type: "image/png" });
}

/**
 * Smart background removal:
 * Always runs full AI segmentation (ISNet) first for both club logos and FIFA card / player photos,
 * guaranteeing any background (solid, dark, colored, gradient, photo) is removed cleanly into a PNG.
 * For logos, also trims empty transparent padding so only the crisp logo is saved.
 */
export async function smartRemoveBackground(
  file: File,
  isLogo = false,
  onProgress?: BgRemovalProgressCallback
): Promise<File> {
  if (typeof window === "undefined") return file;

  try {
    const aiPromise = removeBackgroundWithAI(file, onProgress);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Background removal timed out")), 120000)
    );

    const aiFile = await Promise.race([aiPromise, timeoutPromise]);
    if (isLogo) {
      return await trimTransparentFile(aiFile);
    }
    // Person photos: clean leftover background, then crop to the subject so
    // it fills its frame.
    try {
      const canvas = await blobToCanvas(aiFile);
      cleanSubjectMask(canvas);
      const trimmed = trimTransparentCanvas(canvas, 0.01);
      const blob = await canvasToPngBlob(trimmed);
      if (blob) return new File([blob], aiFile.name, { type: "image/png" });
    } catch (cleanErr) {
      console.warn("[BG Removal] Cutout clean-up skipped:", cleanErr);
    }
    return aiFile;
  } catch (aiErr) {
    console.error("[BG Removal] AI removal failed:", aiErr);
    if (isLogo) {
      // Fallback for logos if offline/CDN blocked
      return await removeSolidBackground(file);
    }
    throw aiErr;
  }
}
