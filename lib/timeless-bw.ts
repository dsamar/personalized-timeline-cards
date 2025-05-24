/**
 * Advanced Image Processing Pipeline for Timeless Black & White
 * Converts arbitrary color photos to a timeless B&W look optimized for printing
 */

export interface TimelessBWOptions {
  /** Enable local contrast enhancement (CLAHE) - slower but better quality */
  enableLocalContrast?: boolean
  /** Add film grain for analog look */
  addGrain?: boolean
  /** Apply vignette effect */
  addVignette?: boolean
  /** Enable dithering for pure B&W printers */
  enableDithering?: boolean
  /** Gamma adjustment strength (0.6-1.4, auto if undefined) */
  gamma?: number
  /** S-curve strength (4-12, default 8) */
  sCurveStrength?: number
  /** Grain intensity (0-32, default 16) */
  grainIntensity?: number
  /** Vignette strength (0-0.3, default 0.15) */
  vignetteStrength?: number
}

/**
 * Convert canvas to timeless black & white with advanced processing
 * This is the main function that replaces the simple B&W conversion
 */
export function timelessBW(canvas: HTMLCanvasElement, options: TimelessBWOptions = {}): HTMLCanvasElement {
  const {
    enableLocalContrast = false,
    addGrain = true,
    addVignette = false, // Disabled for cards by default
    enableDithering = false,
    gamma,
    sCurveStrength = 8,
    grainIntensity = 16,
    vignetteStrength = 0.15,
  } = options

  const ctx = canvas.getContext("2d", { willReadFrequently: true })!

  // ----- read pixels -----
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = imgData
  const pixelCount = data.length / 4
  const hist = new Uint32Array(256)

  // Stage 1: Convert to grayscale using ITU-R BT.709 luminance formula & build histogram
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2])
    data[i] = data[i + 1] = data[i + 2] = lum
    hist[lum]++
  }

  // Stage 2: Auto-levels helpers
  const getPercentileIndex = (percentile: number): number => {
    let acc = 0
    let idx = 0
    const target = percentile * pixelCount
    while (acc < target && idx < 255) {
      acc += hist[idx++]
    }
    return Math.max(0, Math.min(255, idx))
  }

  const lo = getPercentileIndex(0.01)
  const hi = getPercentileIndex(0.99)
  const median = getPercentileIndex(0.5)
  const scale = 255 / Math.max(1, hi - lo)

  // Stage 3: Gamma correction LUT
  const autoGamma = gamma ?? (median < 128 ? 0.8 : 1.2)
  const gammaLUT = new Uint8ClampedArray(256)
  for (let i = 0; i < 256; i++) {
    gammaLUT[i] = Math.round(255 * Math.pow(i / 255, autoGamma))
  }

  // Stage 5: Film S-curve LUT
  const sCurveLUT = new Uint8ClampedArray(256)
  for (let i = 0; i < 256; i++) {
    const normalized = i / 255
    const sCurve = 1 / (1 + Math.exp(-sCurveStrength * (normalized - 0.5)))
    sCurveLUT[i] = Math.round(255 * sCurve)
  }

  // Stage 4: Local contrast enhancement (simplified CLAHE) - optional
  let localContrastData: Uint8ClampedArray | null = null
  if (enableLocalContrast) {
    localContrastData = applyLocalContrast(data, canvas.width, canvas.height)
  }

  // ----- per-pixel processing -----
  for (let i = 0; i < data.length; i += 4) {
    let value = data[i]

    // Use local contrast if enabled, otherwise apply auto-levels
    if (localContrastData) {
      value = localContrastData[i]
    } else {
      // Stage 2: Auto-levels stretch
      value = Math.max(0, Math.min(255, (value - lo) * scale))
    }

    // Stage 3: Apply gamma correction
    value = gammaLUT[Math.round(value)]

    // Stage 5: Apply S-curve
    value = sCurveLUT[Math.round(value)]

    // Stage 6: Add film grain
    if (addGrain) {
      const grain = (Math.random() - 0.5) * grainIntensity
      value = Math.max(0, Math.min(255, value + grain))
    }

    // Write back to all RGB channels
    data[i] = data[i + 1] = data[i + 2] = Math.round(value)
  }

  // Put processed image data back
  ctx.putImageData(imgData, 0, 0)

  // Stage 7: Apply vignette
  if (addVignette) {
    applyVignette(ctx, canvas.width, canvas.height, vignetteStrength)
  }

  // Stage 8: Dithering for pure B&W printers
  if (enableDithering) {
    applyDithering(ctx, canvas.width, canvas.height)
  }

  return canvas
}

/**
 * Apply local contrast enhancement (simplified CLAHE)
 */
function applyLocalContrast(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data.length)
  const tileSize = 64
  const tilesX = Math.ceil(width / tileSize)
  const tilesY = Math.ceil(height / tileSize)

  // Process each tile
  for (let tileY = 0; tileY < tilesY; tileY++) {
    for (let tileX = 0; tileX < tilesX; tileX++) {
      const startX = tileX * tileSize
      const startY = tileY * tileSize
      const endX = Math.min(startX + tileSize, width)
      const endY = Math.min(startY + tileSize, height)

      // Build histogram for this tile
      const tileHist = new Uint32Array(256)
      let tilePixels = 0

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4
          const value = data[idx]
          tileHist[value]++
          tilePixels++
        }
      }

      // Calculate tile-specific contrast stretch
      let tileLow = 0,
        tileHigh = 255
      let acc = 0
      const lowTarget = tilePixels * 0.01
      const highTarget = tilePixels * 0.99

      for (let i = 0; i < 256; i++) {
        acc += tileHist[i]
        if (acc >= lowTarget && tileLow === 0) tileLow = i
        if (acc >= highTarget && tileHigh === 255) {
          tileHigh = i
          break
        }
      }

      const tileScale = 255 / Math.max(1, tileHigh - tileLow)

      // Apply to pixels in this tile
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4
          const value = data[idx]
          const enhanced = Math.max(0, Math.min(255, (value - tileLow) * tileScale))
          result[idx] = enhanced
          result[idx + 1] = enhanced
          result[idx + 2] = enhanced
          result[idx + 3] = data[idx + 3]
        }
      }
    }
  }

  return result
}

/**
 * Apply radial vignette effect
 */
function applyVignette(ctx: CanvasRenderingContext2D, width: number, height: number, strength: number): void {
  const centerX = width / 2
  const centerY = height / 2
  const maxRadius = Math.hypot(width, height) / 2

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius)

  gradient.addColorStop(0.7, `rgba(0,0,0,0)`)
  gradient.addColorStop(1, `rgba(0,0,0,${strength})`)

  ctx.globalCompositeOperation = "multiply"
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.globalCompositeOperation = "source-over"
}

/**
 * Apply Floyd-Steinberg dithering for pure B&W output
 */
function applyDithering(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imgData = ctx.getImageData(0, 0, width, height)
  const { data } = imgData

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const oldPixel = data[idx]
      const newPixel = oldPixel < 128 ? 0 : 255
      const error = oldPixel - newPixel

      data[idx] = data[idx + 1] = data[idx + 2] = newPixel

      // Distribute error to neighboring pixels
      if (x + 1 < width) {
        const rightIdx = (y * width + (x + 1)) * 4
        data[rightIdx] = Math.max(0, Math.min(255, data[rightIdx] + (error * 7) / 16))
      }
      if (y + 1 < height) {
        if (x > 0) {
          const bottomLeftIdx = ((y + 1) * width + (x - 1)) * 4
          data[bottomLeftIdx] = Math.max(0, Math.min(255, data[bottomLeftIdx] + (error * 3) / 16))
        }
        const bottomIdx = ((y + 1) * width + x) * 4
        data[bottomIdx] = Math.max(0, Math.min(255, data[bottomIdx] + (error * 5) / 16))
        if (x + 1 < width) {
          const bottomRightIdx = ((y + 1) * width + (x + 1)) * 4
          data[bottomRightIdx] = Math.max(0, Math.min(255, data[bottomRightIdx] + (error * 1) / 16))
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)
}

/**
 * Quick CSS-based fallback for zero-code prototype
 */
export function quickBWFilter(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")!

  // Apply CSS filters via canvas
  ctx.filter = "grayscale(100%) contrast(125%) brightness(110%)"
  const tempCanvas = document.createElement("canvas")
  const tempCtx = tempCanvas.getContext("2d")!
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  tempCtx.drawImage(canvas, 0, 0)

  ctx.filter = "none"
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(tempCanvas, 0, 0)

  return canvas
}
