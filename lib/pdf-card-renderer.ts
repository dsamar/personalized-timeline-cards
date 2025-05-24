import type jsPDF from "jspdf"

export async function renderCardFace(
  imageData: string,
  text: string,
  isEventSide: boolean,
  cardWidth: number,
  halfHeight: number,
  sequenceId?: number,
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
  const imageMargin = 1.5 * scale // Reduced from 3 * scale
  const textHeight = 12 * scale
  const textSpacing = 2 * scale // Reduced from 3 * scale
  const sequenceIdHeight = 6 * scale
  const sequenceIdSpacing = 1 * scale // Reduced from 2 * scale

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
  const bannerWidth = canvas.width - 4 * scale // Reduced from 8 * scale
  const bannerHeight = textHeight
  const bannerX = (canvas.width - bannerWidth) / 2

  if (isEventSide) {
    // Event banner - black background, white text
    drawCanvasEventBanner(ctx, bannerX, bannerY, bannerWidth, bannerHeight, text, scale)
  } else {
    // Year badge - white background, black text
    drawCanvasYearBadge(ctx, bannerX, bannerY, bannerWidth, bannerHeight, text, scale)
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

function drawCanvasEventBanner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  scale: number,
) {
  // Draw black banner background
  ctx.fillStyle = "#000000"
  ctx.fillRect(x, y, width, height)

  if (text.trim()) {
    // Start with much smaller font size for 2-5 word phrases
    const availableWidth = width - 6 * scale
    let fontSize = 5 * scale // Much smaller starting font size

    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Test different font sizes to find the largest that fits
    for (let testSize = 5 * scale; testSize >= 3 * scale; testSize -= 0.25 * scale) {
      ctx.font = `bold ${testSize}px Arial`
      const textWidth = ctx.measureText(text).width
      if (textWidth <= availableWidth) {
        fontSize = testSize
        break
      }
    }

    ctx.font = `bold ${fontSize}px Arial`

    // Only truncate if text is extremely long (more than 25 characters)
    let displayText = text
    if (text.length > 25 && ctx.measureText(text).width > availableWidth) {
      // Try to fit without truncation first by going even smaller
      for (let testSize = fontSize; testSize >= 2.5 * scale; testSize -= 0.25 * scale) {
        ctx.font = `bold ${testSize}px Arial`
        if (ctx.measureText(text).width <= availableWidth) {
          fontSize = testSize
          displayText = text
          break
        }
      }

      // Only if we absolutely can't fit it, then truncate
      if (ctx.measureText(text).width > availableWidth) {
        while (ctx.measureText(displayText + "...").width > availableWidth && displayText.length > 8) {
          displayText = displayText.slice(0, -1)
        }
        if (displayText.length < text.length) {
          displayText += "..."
        }
      }
    }

    ctx.font = `bold ${fontSize}px Arial`
    ctx.fillText(displayText, x + width / 2, y + height / 2)
  } else {
    // Question marks
    ctx.fillStyle = "#ffffff"
    ctx.font = `bold ${6 * scale}px Arial`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("? ? ?", x + width / 2, y + height / 2)
  }
}

function drawCanvasYearBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  scale: number,
) {
  // Draw white rectangular banner with black border (full width like event banner)
  ctx.fillStyle = "#ffffff"
  ctx.strokeStyle = "#000000"
  ctx.lineWidth = 0.3 * scale

  // Use same rectangular style as event banner
  ctx.fillRect(x, y, width, height)
  ctx.strokeRect(x, y, width, height)

  // Draw year text (black text on white background)
  ctx.fillStyle = "#000000"
  ctx.font = `bold ${8 * scale}px Arial`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, x + width / 2, y + height / 2)
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
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
) {
  // Render card face to canvas
  const canvas = await renderCardFace(imageData, text, isEventSide, cardWidth, halfHeight, sequenceId)

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
) {
  // Render normal card face to canvas
  const canvas = await renderCardFace(imageData, text, isEventSide, cardWidth, halfHeight, sequenceId)

  // Flip the entire canvas 180 degrees
  const flippedCanvas = flipCanvas(canvas)

  // Convert flipped canvas to image data and add to PDF
  const canvasImageData = flippedCanvas.toDataURL("image/jpeg", 0.85)
  pdf.addImage(canvasImageData, "JPEG", x, y, cardWidth, halfHeight)
}
