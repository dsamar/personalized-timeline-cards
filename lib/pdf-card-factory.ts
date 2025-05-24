import type jsPDF from "jspdf"
import type { TimelineCard } from "@/types/timeline-card"
import { cropImageTo3x4 } from "@/lib/image-utils"
import { drawCardFace, drawFlippedCardFace } from "@/lib/pdf-card-renderer"

export function formatDateText(card: TimelineCard, yearCounts: Record<number, number>): string {
  // Always show month when we have a full date, regardless of year conflicts
  if (card.fullDate) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames[card.fullDate.getMonth()]
    return `${month} ${card.year}`
  }

  // Fallback to just year if no full date available
  return card.year.toString()
}

export async function addImageToCard(
  pdf: jsPDF,
  card: TimelineCard,
  x: number,
  y: number,
  cardWidth: number,
  halfHeight: number,
  yearCounts: Record<number, number>,
  sequenceId: number,
): Promise<void> {
  const img = new Image()
  img.crossOrigin = "anonymous"

  // Wait for image to load completely before proceeding
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = (error) => reject(error)
    img.src = card.image
  })

  try {
    // Create BW Images
    const normalBWImageData = cropImageTo3x4(img, 150, 200)

    // Format text
    const dateText = formatDateText(card, yearCounts)
    const eventText = card.eventName || ""

    // TOP HALF: Year side (with sequence ID and event name) - FLIPPED
    await drawFlippedCardFace(
      pdf,
      normalBWImageData,
      dateText,
      false,
      x,
      y,
      cardWidth,
      halfHeight,
      sequenceId,
      eventText,
    )

    // BOTTOM HALF: Event side (with sequence ID) - NORMAL
    await drawCardFace(pdf, normalBWImageData, eventText, true, x, y + halfHeight, cardWidth, halfHeight, sequenceId)
  } catch (error) {
    throw error
  }
}

export function addPlaceholderToCard(
  pdf: jsPDF,
  card: TimelineCard,
  x: number,
  y: number,
  cardWidth: number,
  halfHeight: number,
  yearCounts: Record<number, number>,
  sequenceId: number,
) {
  // Create placeholder images
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  canvas.width = 150
  canvas.height = 200

  ctx.fillStyle = "#f0f0f0"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#999999"
  ctx.font = "20px Arial"
  ctx.textAlign = "center"
  ctx.fillText("Image", canvas.width / 2, canvas.height / 2)

  const placeholderImageData = canvas.toDataURL("image/jpeg", 0.85)

  // Format text
  const dateText = formatDateText(card, yearCounts)
  const eventText = card.eventName || ""

  // TOP HALF: Year side (flipped, with sequence ID and event name)
  drawFlippedCardFace(pdf, placeholderImageData, dateText, false, x, y, cardWidth, halfHeight, sequenceId, eventText)

  // BOTTOM HALF: Event side (normal, with sequence ID)
  drawCardFace(pdf, placeholderImageData, eventText, true, x, y + halfHeight, cardWidth, halfHeight, sequenceId)
}
