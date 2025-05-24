"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Trash2, Calendar } from "lucide-react"
import type { TimelineCard } from "@/types/timeline-card"
import { generateCacheKey, saveEventName } from "@/lib/event-cache"

interface CardItemProps {
  card: TimelineCard
  index: number
  onUpdate: (updates: Partial<TimelineCard>) => void
  onRemove: () => void
}

export function CardItem({ card, index, onUpdate, onRemove }: CardItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleEventNameUpdate = (newName: string) => {
    // Limit event names to 20 characters for better display
    const limitedName = newName.length > 20 ? newName.substring(0, 20) : newName
    onUpdate({ eventName: limitedName })

    // Save to cache
    const cacheKey = generateCacheKey(card.fullDate, card.filename)
    saveEventName(cacheKey, limitedName)
  }

  const handleYearUpdate = (newYear: number) => {
    onUpdate({ year: newYear })
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="aspect-video bg-muted rounded overflow-hidden">
        <img
          src={card.image || "/placeholder.svg"}
          alt={card.eventName || "Timeline card"}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">#{index + 1}</Label>
          <Label className="text-xs text-muted-foreground">Event Name (max 20 chars):</Label>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={card.eventName}
              onChange={(e) => handleEventNameUpdate(e.target.value)}
              placeholder="Enter event name..."
              autoFocus
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false)
                } else if (e.key === "Escape") {
                  setIsEditing(false)
                }
              }}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="px-2">
              ✓
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground italic">
              {card.eventName || "Click to add event name"}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            value={card.year}
            onChange={(e) => handleYearUpdate(Number.parseInt(e.target.value) || card.year)}
            className="w-20"
            min="1000"
            max="2100"
          />
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Source: {card.dateSource}
          {card.fullDate && <div>Full date: {card.fullDate.toLocaleDateString()}</div>}
        </div>
      </div>
    </div>
  )
}
