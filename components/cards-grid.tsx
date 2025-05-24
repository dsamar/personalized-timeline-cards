"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { TimelineCard } from "@/types/timeline-card"
import { CardItem } from "@/components/card-item"
import { generatePDF } from "@/lib/pdf-generator"
import { useState } from "react"
import { generateCacheKey, saveEventName } from "@/lib/event-cache"

interface CardsGridProps {
  cards: TimelineCard[]
  onCardUpdate: (id: string, updates: Partial<TimelineCard>) => void
  onAllCardsUpdate: (updates: Array<{ id: string; updates: Partial<TimelineCard> }>) => void
  onCardRemove: (id: string) => void
}

export function CardsGrid({ cards, onCardUpdate, onAllCardsUpdate, onCardRemove }: CardsGridProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  if (cards.length === 0) return null

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      await generatePDF(cards)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleUseFilenames = () => {
    // Prepare all updates at once
    const allUpdates = cards.map((card) => {
      // Remove file extension and limit to 20 characters
      const nameWithoutExt = card.filename.replace(/\.[^/.]+$/, "")
      const limitedName = nameWithoutExt.length > 20 ? nameWithoutExt.substring(0, 20) : nameWithoutExt

      // Save to cache
      const cacheKey = generateCacheKey(card.fullDate, card.filename)
      saveEventName(cacheKey, limitedName)

      return {
        id: card.id,
        updates: { eventName: limitedName },
      }
    })

    // Update all cards at once
    onAllCardsUpdate(allUpdates)
  }

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Timeline Cards ({cards.length})</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleUseFilenames}
            variant="outline"
            className="flex items-center gap-2"
            disabled={cards.length === 0}
          >
            Use Filenames as Event Names
          </Button>
          <Button onClick={handleExportPDF} disabled={isGeneratingPDF} className="flex items-center gap-2">
            {isGeneratingPDF ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Card Order Preview:</h4>
          <div className="text-sm space-y-1">
            {cards.map((card, index) => (
              <div key={card.id} className="flex items-center gap-2">
                <span className="font-mono text-xs bg-background px-1 rounded">{index + 1}</span>
                <span>{card.year}</span>
                <span className="text-muted-foreground">-</span>
                <span>{card.eventName || "Untitled"}</span>
                {card.fullDate && (
                  <span className="text-xs text-muted-foreground">({card.fullDate.toLocaleDateString()})</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, index) => (
            <CardItem
              key={card.id}
              card={card}
              index={index}
              onUpdate={(updates) => onCardUpdate(card.id, updates)}
              onRemove={() => onCardRemove(card.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
