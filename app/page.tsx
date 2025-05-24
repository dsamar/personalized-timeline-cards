"use client"

import { useState } from "react"
import type { TimelineCard } from "@/types/timeline-card"
import { UploadSection } from "@/components/upload-section"
import { CardsGrid } from "@/components/cards-grid"
import { InstructionsCard } from "@/components/instructions-card"
import { ExternalLink, Github } from "lucide-react"

function sortCards(cards: TimelineCard[]): TimelineCard[] {
  return cards.sort((a, b) => {
    // First sort by year
    if (a.year !== b.year) {
      return a.year - b.year
    }

    // If same year, sort by full date if both have it
    if (a.fullDate && b.fullDate) {
      return a.fullDate.getTime() - b.fullDate.getTime()
    }

    // If only one has full date, prioritize the one with full date (earlier in year)
    if (a.fullDate && !b.fullDate) return -1
    if (!a.fullDate && b.fullDate) return 1

    // If neither has full date, sort by filename as fallback
    return a.filename.localeCompare(b.filename)
  })
}

export default function TimelineCardCreator() {
  const [cards, setCards] = useState<TimelineCard[]>([])

  const addCards = (newCards: TimelineCard[]) => {
    const allCards = [...cards, ...newCards]
    const sortedCards = sortCards(allCards)

    const renamedCards = sortedCards.map((card, index) => ({
      ...card,
      eventName: card.eventName.startsWith("EVENT_") ? `EVENT_${index + 1}` : card.eventName,
    }))
    setCards(renamedCards)
  }

  const updateCard = (id: string, updates: Partial<TimelineCard>) => {
    const updatedCards = cards.map((card) => (card.id === id ? { ...card, ...updates } : card))

    if (updates.year) {
      const sortedCards = sortCards(updatedCards)
      setCards(sortedCards)
    } else {
      setCards(updatedCards)
    }
  }

  const updateAllCards = (updates: Array<{ id: string; updates: Partial<TimelineCard> }>) => {
    const updatedCards = cards.map((card) => {
      const update = updates.find((u) => u.id === card.id)
      return update ? { ...card, ...update.updates } : card
    })
    setCards(updatedCards)
  }

  const removeCard = (id: string) => {
    setCards(cards.filter((card) => card.id !== id))
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Timeline Card Creator</h1>
            <p className="text-muted-foreground">
              Create personalized timeline cards from your photos. Upload images and we'll extract dates from EXIF data.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/dsamar/personalized-timeline-cards"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>

        <div className="bg-muted/50 border border-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Game Attribution:</strong> Inspired by{" "}
            <a
              href="https://boardgamegeek.com/boardgame/128664/timeline"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Timeline (2012)
              <ExternalLink className="h-3 w-3" />
            </a>{" "}
            by Frédéric Henry. Art by{" "}
            <a
              href="https://www.jeremiefleury.art/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Jérémie Fleury
              <ExternalLink className="h-3 w-3" />
            </a>{" "}
            and team. Published by Asmodee. This tool creates personalized versions using your photos.
          </p>
        </div>
      </div>

      <UploadSection cards={cards} onCardsAdd={addCards} />
      <CardsGrid cards={cards} onCardUpdate={updateCard} onAllCardsUpdate={updateAllCards} onCardRemove={removeCard} />
      <InstructionsCard />
    </div>
  )
}
