import type jsPDF from "jspdf"

export async function renderCardFace(
  imageData: string,
  text: string,
  isEventSide: boolean,
  cardWidth: number,
  halfHeight: number,
  sequenceId?: number,
  eventName?: string, // Add optional event name parameter
): Promise<HTMLCanvasElement> {
  // Create a canvas to render the card face
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  // Set canvas size to match card half dimensions (scaled up for quality)
  const scale = 3
  canvas.width = cardWidth * scale
  canvas.height = halfHeight * scale

  // Clear canvas with white background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Calculate dimensions - REDUCED MARGINS for bigger images
  const imageMargin = 1.5 * scale
  const textHeight = 20 * scale
  const textSpacing = 2 * scale
  const sequenceIdHeight = 6 * scale
  const sequenceIdSpacing = 1 * scale

  // Reserve space for sequence ID at bottom
  const availableImageHeight =
    canvas.height - imageMargin * 2 - textHeight - textSpacing - sequenceIdHeight - sequenceIdSpacing
  const availableImageWidth = canvas.width - imageMargin * 2

  // Calculate image size maintaining 3:4 aspect ratio
  const imageAspectRatio = 3 / 4
  let imageWidth, imageHeight

  if (availableImageWidth / availableImageHeight > imageAspectRatio) {
    imageHeight = availableImageHeight
    imageWidth = imageHeight * imageAspectRatio
  } else {
    imageWidth = availableImageWidth
    imageHeight = imageWidth / imageAspectRatio
  }

  const imageX = (canvas.width - imageWidth) / 2
  const imageY = imageMargin

  // Load and draw image
  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight)
      resolve()
    }
    img.onerror = (error) => reject(error)
    img.src = imageData
  })

  // Draw text banner below image
  const bannerY = imageY + imageHeight + textSpacing
  const bannerWidth = canvas.width - 4 * scale
  const bannerHeight = textHeight
  const bannerX = (canvas.width - bannerWidth) / 2

  if (isEventSide) {
    // Event banner - black background, white text
    drawCanvasEventBanner(ctx, bannerX, bannerY, bannerWidth, bannerHeight, text, scale)
  } else {
    // Year badge - white background, black text, with event name
    drawCanvasYearBadge(ctx, bannerX, bannerY, bannerWidth, bannerHeight, text, scale, eventName)
  }

  // Draw sequence ID at the bottom (invisible - white on white)
  if (sequenceId !== undefined) {
    const sequenceY = bannerY + bannerHeight + sequenceIdSpacing
    drawSequenceId(ctx, canvas.width / 2, sequenceY, sequenceId, scale)
  }

  return canvas
}

export function flipCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const flippedCanvas = document.createElement("canvas")
  const ctx = flippedCanvas.getContext("2d")!

  flippedCanvas.width = canvas.width
  flippedCanvas.height = canvas.height

  // Flip the entire canvas 180 degrees
  ctx.translate(flippedCanvas.width / 2, flippedCanvas.height / 2)
  ctx.rotate(Math.PI)
  ctx.drawImage(canvas, -flippedCanvas.width / 2, -flippedCanvas.height / 2)

  return flippedCanvas
}

function drawSequenceId(ctx: CanvasRenderingContext2D, centerX: number, y: number, sequenceId: number, scale: number) {
  // Draw sequence ID in white text (invisible on white background)
  ctx.fillStyle = "#ffffff"
  ctx.font = `${4 * scale}px Arial`
  ctx.textAlign = "center"
  ctx.textBaseline = "top"
  ctx.fillText(sequenceId.toString(), centerX, y)
}

/* ----------  UTILS  ---------- */

/** monospace char width probe (cached) */
function monoCharWidth(ctx: CanvasRenderingContext2D, scale: number): number {
  const key = `mono-${scale}`;
  const cache = (monoCharWidth as any)[key];
  if (cache) return cache;
  ctx.font = `${scale}px 'Courier New', monospace`;
  const w = ctx.measureText("M").width;
  (monoCharWidth as any)[key] = w;
  return w;
}

/** font size that guarantees `maxChars` fit */
function calcMonoFontSize(
  ctx: CanvasRenderingContext2D,
  avail: number,
  maxChars: number,
  scale: number
) {
  const cw = monoCharWidth(ctx, scale);
  return Math.floor((avail / (cw * maxChars)) * scale);
}

/* ----------  EVENT BANNER  ---------- */

function drawCanvasEventBanner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  scale: number
) {
  ctx.fillStyle = "#000";
  ctx.fillRect(x, y, width, height);

  const t = text.trim().slice(0, 20);               // hard cap
  const tier = t.length <= 5 ? 5 : t.length <= 15 ? 15 : 20;

  const fontPx = calcMonoFontSize(ctx, width - 4 * scale, tier, scale);
  ctx.font = `bold ${fontPx}px 'Courier New', monospace`;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";

  // width of the actual string (monospace ⇒ len * charW)
  const charW = monoCharWidth(ctx, fontPx);
  const txtW  = charW * t.length;
  const cx    = x + width / 2 - txtW / 2;           // left-aligned start

  ctx.textAlign = "left";
  ctx.fillText(t, cx, y + height / 2);
}

/* ----------  YEAR + EVENT BADGE  ---------- */

function drawCanvasYearBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  dateText: string,
  scale: number,
  eventName?: string
) {
  // frame
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 0.3 * scale;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);

  const avail = width - 4 * scale;

  // ---- date line (fixed 8 chars) ----
  const datePx = calcMonoFontSize(ctx, avail, 8, scale);
  ctx.font = `bold ${datePx}px 'Courier New', monospace`;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";

  let charW = monoCharWidth(ctx, datePx);
  let cx = x + width / 2 - charW * dateText.length / 2;
  ctx.textAlign = "left";
  ctx.fillText(dateText, cx, y + height / 4);

  // ---- optional event line ----
  if (eventName?.trim()) {
    const t = eventName.trim().slice(0, 20);
    const tier = t.length <= 5 ? 5 : t.length <= 15 ? 15 : 20;
    const evPx = calcMonoFontSize(ctx, avail, tier, scale);

    ctx.font = `${evPx}px 'Courier New', monospace`;
    charW = monoCharWidth(ctx, evPx);
    cx = x + width / 2 - charW * t.length / 2;
    ctx.fillText(t, cx, y + (3 * height) / 4);
  }
}

export async function drawCardFace(
  pdf: jsPDF,
  imageData: string,
  text: string,
  isEventSide: boolean,
  x: number,
  y: number,
  cardWidth: number,
  halfHeight: number,
  sequenceId?: number,
  eventName?: string,
) {
  // Render card face to canvas
  const canvas = await renderCardFace(imageData, text, isEventSide, cardWidth, halfHeight, sequenceId, eventName)

  // Convert canvas to image data and add to PDF
  const canvasImageData = canvas.toDataURL("image/jpeg", 0.85)
  pdf.addImage(canvasImageData, "JPEG", x, y, cardWidth, halfHeight)
}

export async function drawFlippedCardFace(
  pdf: jsPDF,
  imageData: string,
  text: string,
  isEventSide: boolean,
  x: number,
  y: number,
  cardWidth: number,
  halfHeight: number,
  sequenceId?: number,
  eventName?: string,
) {
  // Render normal card face to canvas
  const canvas = await renderCardFace(imageData, text, isEventSide, cardWidth, halfHeight, sequenceId, eventName)

  // Flip the entire canvas 180 degrees
  const flippedCanvas = flipCanvas(canvas)

  // Convert flipped canvas to image data and add to PDF
  const canvasImageData = flippedCanvas.toDataURL("image/jpeg", 0.85)
  pdf.addImage(canvasImageData, "JPEG", x, y, cardWidth, halfHeight)
}
