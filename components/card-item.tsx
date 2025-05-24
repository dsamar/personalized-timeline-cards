"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Trash2, Calendar } from "lucide-react"
import type { TimelineCard } from "@/types/timeline-card"
import { generateCacheKey, saveEventName } from "@/lib/event-cache"

interface CardItemProps {
  card: TimelineCard
  index: number
  onUpdate: (updates: Partial<TimelineCard>) => void
  onRemove: () => void
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

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
    // Update the year while preserving the month if we have a full date
    if (card.fullDate) {
      const newDate = new Date(card.fullDate)
      newDate.setFullYear(newYear)
      onUpdate({ year: newYear, fullDate: newDate })
    } else {
      onUpdate({ year: newYear })
    }
  }

  const handleMonthUpdate = (newMonth: number) => {
    // Update the month, creating or updating the full date
    let newDate: Date
    if (card.fullDate) {
      newDate = new Date(card.fullDate)
      newDate.setMonth(newMonth)
    } else {
      // Create a new date with the current year and selected month
      newDate = new Date(card.year, newMonth, 1)
    }
    onUpdate({ fullDate: newDate })
  }

  const currentMonth = card.fullDate ? card.fullDate.getMonth() : undefined

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* 3:4 aspect ratio image preview */}
      <div className="aspect-[3/4] bg-muted rounded overflow-hidden">
        <img
          src={card.image || "/placeholder.svg"}
          alt={card.eventName || "Timeline card"}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-3">
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

        {/* Date controls */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Date:
          </Label>

          <div className="flex items-center gap-2">
            {/* Month selector */}
            <Select
              value={currentMonth !== undefined ? currentMonth.toString() : ""}
              onValueChange={(value) => handleMonthUpdate(Number.parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year input */}
            <Input
              type="number"
              value={card.year}
              onChange={(e) => handleYearUpdate(Number.parseInt(e.target.value) || card.year)}
              className="w-20"
              min="1000"
              max="2100"
              placeholder="Year"
            />

            <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Date source info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Source: {card.dateSource}</div>
          {card.fullDate && (
            <div>
              Full date: {card.fullDate.toLocaleDateString()}
              {currentMonth !== undefined && (
                <span className="ml-2 text-primary">
                  → {monthNames[currentMonth]} {card.year}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
