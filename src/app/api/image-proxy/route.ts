import { NextRequest } from "next/server";

/**
 * Same-origin image proxy used by the PDF export.
 *
 * html2canvas can only draw images that are same-origin or served with CORS
 * headers. Player photos live on external storage (e.g. S3) without CORS, so
 * they disappear from exported PDFs. Fetching them through this route makes
 * them same-origin. Only images are proxied, and responses are size-limited.
 */
const MAX_BYTES = 10 * 1024 * 1024;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) return new Response("Missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return new Response("Unsupported protocol", { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), { cache: "no-store" });
    if (!upstream.ok) return new Response("Upstream error", { status: 502 });

    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return new Response("Not an image", { status: 415 });
    }

    const buffer = await upstream.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) return new Response("Image too large", { status: 413 });

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Failed to fetch image", { status: 502 });
  }
}
