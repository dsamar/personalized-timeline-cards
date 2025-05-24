import type jsPDF from "jspdf"

export interface CardDesignElements {
  yearBadge: {
    color: string
    textColor: string
    borderRadius: number
  }
  eventBanner: {
    color: string
    textColor: string
    borderColor: string
  }
}

export const defaultDesign: CardDesignElements = {
  yearBadge: {
    color: "#ffffff", // White background for year
    textColor: "#000000", // Black text
    borderRadius: 8,
  },
  eventBanner: {
    color: "#000000", // Black background for event
    textColor: "#ffffff", // White text
    borderColor: "#000000",
  },
}

export function drawYearBadge(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  design: CardDesignElements = defaultDesign,
) {
  // Draw white oval badge with black border for year
  pdf.setFillColor(design.yearBadge.color)
  pdf.setDrawColor("#000000") // Black border
  pdf.setLineWidth(0.5)

  // Create oval shape
  const cornerRadius = Math.min(width, height) * 0.4
  pdf.roundedRect(x, y, width, height, cornerRadius, cornerRadius, "FD")

  // Add year text
  pdf.setTextColor(design.yearBadge.textColor)
  pdf.setFontSize(14)
  pdf.setFont(undefined, "bold")
  pdf.text(text, x + width / 2, y + height / 2 + 2, { align: "center" })
}

export function drawEventBanner(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  design: CardDesignElements = defaultDesign,
) {
  // Draw black banner background
  pdf.setFillColor(design.eventBanner.color)
  pdf.setDrawColor(design.eventBanner.borderColor)
  pdf.setLineWidth(0.5)

  const cornerRadius = 3
  pdf.roundedRect(x, y, width, height, cornerRadius, cornerRadius, "FD")

  if (text.trim()) {
    // Real event name - white text on black background
    pdf.setTextColor(design.eventBanner.textColor)
    pdf.setFontSize(10)
    pdf.setFont(undefined, "bold")

    const textLines = pdf.splitTextToSize(text, width - 8)
    const lineHeight = 3.5
    const totalTextHeight = textLines.length * lineHeight
    const startY = y + height / 2 - totalTextHeight / 2 + lineHeight

    textLines.forEach((line: string, index: number) => {
      pdf.text(line, x + width / 2, startY + index * lineHeight, { align: "center" })
    })
  } else {
    // Simple 3 question marks - white text on black background
    pdf.setTextColor("#ffffff")
    pdf.setFontSize(12)
    pdf.setFont(undefined, "bold")
    pdf.text("? ? ?", x + width / 2, y + height / 2 + 1, { align: "center" })
  }
}
