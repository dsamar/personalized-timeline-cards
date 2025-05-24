import jsPDF from "jspdf"
import type { TimelineCard } from "@/types/timeline-card"
import { addImageToCard, addPlaceholderToCard } from "@/lib/pdf-card-factory"

export async function generatePDF(cards: TimelineCard[]) {
  const pdf = new jsPDF("landscape", "mm", "letter")
  const pageWidth = 279.4
  const pageHeight = 215.9

  const cardWidth = 45
  const cardHeight = 180
  const halfHeight = cardHeight / 2
  const spacing = 8
  const cardsPerPage = 5

  const totalCardsWidth = cardsPerPage * cardWidth + (cardsPerPage - 1) * spacing
  const startMargin = (pageWidth - totalCardsWidth) / 2

  // Determine which cards need month display
  const yearCounts = cards.reduce(
    (acc, card) => {
      acc[card.year] = (acc[card.year] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )

  // Process cards in batches of 5 per page
  for (let pageIndex = 0; pageIndex < Math.ceil(cards.length / cardsPerPage); pageIndex++) {
    // Add new page if not the first page
    if (pageIndex > 0) {
      pdf.addPage()
    }

    // Process 5 cards for this page
    for (let positionOnPage = 0; positionOnPage < cardsPerPage; positionOnPage++) {
      const cardIndex = pageIndex * cardsPerPage + positionOnPage

      // Stop if we've processed all cards
      if (cardIndex >= cards.length) {
        break
      }

      const card = cards[cardIndex]
      const sequenceId = cardIndex + 1

      // Calculate position
      const x = startMargin + positionOnPage * (cardWidth + spacing)
      const y = (pageHeight - cardHeight) / 2

      // Draw fold line
      pdf.setDrawColor(200)
      pdf.setLineWidth(0.2)
      pdf.line(x, y + halfHeight, x + cardWidth, y + halfHeight)

      // Add the card
      try {
        await addImageToCard(pdf, card, x, y, cardWidth, halfHeight, yearCounts, sequenceId)
      } catch (error) {
        addPlaceholderToCard(pdf, card, x, y, cardWidth, halfHeight, yearCounts, sequenceId)
      }

      // Add cutting guides (between cards, not at edges)
      if (positionOnPage > 0) {
        const guideX = x - spacing / 2
        pdf.setDrawColor(150)
        pdf.setLineWidth(0.1)
        pdf.line(guideX, y - 5, guideX, y + cardHeight + 5)
      }
    }
  }

  pdf.save("timeline-cards.pdf")
}
