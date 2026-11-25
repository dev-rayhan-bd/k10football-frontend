import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

/** Renders the two printable report pages (by element id) into a landscape A4 PDF. */
export const generateEvaluationPdf = async (pageIds: [string, string], fileName: string) => {
  const page1 = document.getElementById(pageIds[0]);
  const page2 = document.getElementById(pageIds[1]);
  if (!page1 || !page2) {
    toast.error("Evaluation report is not ready yet.");
    return;
  }

  const toastId = toast.loading("Generating PDF report... Please wait.");

  // html2canvas draws text too low when images are display:block (Tailwind preflight),
  // which makes row borders cut through the labels. Patch only the cloned document.
  const fixCloneForCanvas = (clonedDoc: Document) => {
    const style = clonedDoc.createElement("style");
    style.innerHTML = "img { display: inline-block !important; }";
    clonedDoc.head.appendChild(style);
  };

  // Save original getComputedStyle and create dummy div to convert modern colors (oklch, lab, etc.)
  const originalGetComputedStyle = window.getComputedStyle;
  const dummy = document.createElement("div");
  dummy.style.display = "none";
  document.body.appendChild(dummy);
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = 1;
  colorCanvas.height = 1;
  const colorCtx = colorCanvas.getContext("2d", { willReadFrequently: true });
  const colorCache = new Map<string, string>();

  const convertModernColor = (value: string) => {
    if (typeof value !== "string") return value;
    if (!value.includes("oklch") && !value.includes("lab") && !value.includes("oklab") && !value.includes("lch")) {
      return value;
    }
    return value.replace(/(oklch|oklab|lab|lch)\([^)]+\)/g, (match) => {
      const cached = colorCache.get(match);
      if (cached) return cached;
      let resolved = "rgb(0, 0, 0)";
      try {
        // Chrome keeps oklch() in computed styles, so rasterize the color to get real RGB.
        if (colorCtx) {
          colorCtx.clearRect(0, 0, 1, 1);
          colorCtx.fillStyle = "#000";
          colorCtx.fillStyle = match;
          colorCtx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = colorCtx.getImageData(0, 0, 1, 1).data;
          resolved = `rgba(${r}, ${g}, ${b}, ${Number((a / 255).toFixed(3))})`;
        } else {
          dummy.style.color = match;
          const computed = originalGetComputedStyle(dummy).color;
          if (computed.startsWith("rgb") || computed.startsWith("#")) resolved = computed;
        }
      } catch {
        // keep the fallback
      }
      colorCache.set(match, resolved);
      return resolved;
    });
  };

  // Apply computed style proxy shim
  window.getComputedStyle = function (el, pseudoEl) {
    const style = originalGetComputedStyle(el, pseudoEl);
    return new Proxy(style, {
      get(target, prop) {
        if (prop === "getPropertyValue") {
          return (propertyName: string) => {
            const val = target.getPropertyValue(propertyName);
            return convertModernColor(val);
          };
        }
        if (typeof prop === "string") {
          const targetRecord = target as unknown as Record<string, unknown>;
          const val = targetRecord[prop];
          if (typeof val === "string") {
            return convertModernColor(val);
          }
          if (typeof val === "function") {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            return (val as Function).bind(target);
          }
          return val;
        }
        const targetRecord = target as unknown as Record<string | symbol, unknown>;
        return targetRecord[prop];
      },
    });
  };

  const capture = async (el: HTMLElement, label: string) => {
    try {
      return await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: fixCloneForCanvas,
      });
    } catch (err) {
      throw new Error(`${label} render failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const exportImage = (canvas: HTMLCanvasElement, label: string) => {
    try {
      return canvas.toDataURL("image/png");
    } catch (err) {
      throw new Error(`${label} export failed (likely CORS/Taint issue): ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  try {
    const pdf = new jsPDF("l", "mm", "a4");
    const imgWidth = 297; // A4 landscape width in mm
    const imgHeight = 210; // A4 landscape height in mm

    toast.loading("Rendering Page 1...", { id: toastId });
    const canvas1 = await capture(page1, "Page 1");
    toast.loading("Rendering Page 2...", { id: toastId });
    const canvas2 = await capture(page2, "Page 2");

    toast.loading("Assembling PDF document...", { id: toastId });
    pdf.addImage(exportImage(canvas1, "Page 1"), "PNG", 0, 0, imgWidth, imgHeight);
    pdf.addPage();
    pdf.addImage(exportImage(canvas2, "Page 2"), "PNG", 0, 0, imgWidth, imgHeight);

    pdf.save(fileName);
    toast.success("PDF report downloaded successfully!", { id: toastId });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("PDF generation failed:", error);
    toast.error(`Failed to generate PDF: ${msg}`, { id: toastId });
  } finally {
    // Restore original getComputedStyle
    window.getComputedStyle = originalGetComputedStyle;
    if (dummy.parentNode) {
      dummy.parentNode.removeChild(dummy);
    }
  }
};
