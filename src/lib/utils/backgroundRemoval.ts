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
    model: "isnet_quint8",
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
