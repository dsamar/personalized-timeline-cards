import { timelessBW } from "./timeless-bw"

/**
 * Downscale image to optimal resolution for 300 DPI printing
 * Cards are 45mm wide in PDF, so we need ~531 pixels width at 300 DPI
 * We'll use 600px width (over-estimate) to ensure crisp printing
 */
function downscaleForPrint(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const targetWidth = 600 // Over-estimate for 300 DPI at 45mm card width
  const targetHeight = 800 // Maintain 3:4 aspect ratio (600 * 4/3)

  // Only downscale if image is larger than target
  if (canvas.width <= targetWidth && canvas.height <= targetHeight) {
    return canvas
  }

  const downscaledCanvas = document.createElement("canvas")
  const ctx = downscaledCanvas.getContext("2d")!

  downscaledCanvas.width = targetWidth
  downscaledCanvas.height = targetHeight

  // Use high-quality scaling
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"

  ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight)

  return downscaledCanvas
}

export function cropImageTo3x4(img: HTMLImageElement, targetWidth: number, targetHeight: number): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  const scale = 3
  canvas.width = targetWidth * scale
  canvas.height = targetHeight * scale

  const targetAspectRatio = 3 / 4
  const imgAspectRatio = img.width / img.height

  let sourceX = 0
  let sourceY = 0
  let sourceWidth = img.width
  let sourceHeight = img.height

  if (imgAspectRatio > targetAspectRatio) {
    sourceWidth = img.height * targetAspectRatio
    sourceX = (img.width - sourceWidth) / 2
  } else {
    sourceHeight = img.width / targetAspectRatio
    sourceY = (img.height - sourceHeight) / 2
  }

  // Draw the image
  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)

  // Downscale to optimal print resolution before processing
  const optimizedCanvas = downscaleForPrint(canvas)

  // Convert to timeless black and white using advanced processing
  timelessBW(optimizedCanvas, {
    enableLocalContrast: false,
    addGrain: true,
    addVignette: true,
    enableDithering: false,
    sCurveStrength: 6,
    grainIntensity: 12,
  })

  return optimizedCanvas.toDataURL("image/jpeg", 0.85)
}
