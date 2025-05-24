import jsPDF from "jspdf"
import type { TimelineCard } from "@/types/timeline-card"
import { addImageToCard, addPlaceholderToCard } from "@/lib/pdf-card-factory"

export async function generatePDF(cards: TimelineCard[]) {
  const pdf = new jsPDF("landscape", "mm", "letter")
  const pageWidth = 279.4
  const pageHeight = 215.9

  // Increased card dimensions for better use of space
  const cardWidth = 52 // Increased from 45mm
  const cardHeight = 190 // Increased from 180mm
  const halfHeight = cardHeight / 2
  const spacing = 10 // Slightly increased spacing between cards
  const cardsPerPage = 5

  // Calculate margins so edge margins equal the spacing between cards
  const totalCardsWidth = cardsPerPage * cardWidth + (cardsPerPage - 1) * spacing
  const startMargin = spacing // Make edge margin equal to spacing between cards

  // Verify we have enough space (should be: 5*52 + 4*10 + 2*10 = 320mm, but page is 279.4mm)
  // Let's recalculate to fit properly
  const availableWidth = pageWidth - 2 * spacing // Reserve equal margins on both sides
  const availableForCards = availableWidth - (cardsPerPage - 1) * spacing
  const optimizedCardWidth = Math.floor(availableForCards / cardsPerPage)

  // Use the optimized width (should be around 47-48mm)
  const finalCardWidth = Math.min(optimizedCardWidth, 48) // Cap at 48mm for safety
  const finalSpacing = (pageWidth - cardsPerPage * finalCardWidth) / (cardsPerPage + 1)

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

      // Calculate position with equal spacing
      const x = finalSpacing + positionOnPage * (finalCardWidth + finalSpacing)
      const y = (pageHeight - cardHeight) / 2

      // Draw fold line
      pdf.setDrawColor(200)
      pdf.setLineWidth(0.2)
      pdf.line(x, y + halfHeight, x + finalCardWidth, y + halfHeight)

      // Add the card
      try {
        await addImageToCard(pdf, card, x, y, finalCardWidth, halfHeight, yearCounts, sequenceId)
      } catch (error) {
        addPlaceholderToCard(pdf, card, x, y, finalCardWidth, halfHeight, yearCounts, sequenceId)
      }

      // Add cutting guides (between cards, not at edges)
      if (positionOnPage > 0) {
        const guideX = x - finalSpacing / 2
        pdf.setDrawColor(150)
        pdf.setLineWidth(0.1)
        pdf.line(guideX, y - 5, guideX, y + cardHeight + 5)
      }
    }
  }

  pdf.save("timeline-cards.pdf")
}
