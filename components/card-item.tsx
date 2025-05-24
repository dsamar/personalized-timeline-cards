"use client"
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
  isEditingCard: boolean
  onEditingChange: (cardId: string | null) => void
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function CardItem({ card, index, onUpdate, onRemove, isEditingCard, onEditingChange }: CardItemProps) {
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
        </div>

        {isEditingCard ? (
          <div className="flex items-center gap-2 p-2 bg-blue-50 border-2 border-blue-300 rounded-md">
            <Input
              value={card.eventName}
              onChange={(e) => handleEventNameUpdate(e.target.value)}
              placeholder="Enter event name..."
              autoFocus
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onEditingChange(null)
                } else if (e.key === "Escape") {
                  onEditingChange(null)
                }
              }}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={() => onEditingChange(null)} className="px-2">
              ✓
            </Button>
          </div>
        ) : (
          <div
            className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
            onClick={() => onEditingChange(card.id)}
          >
            <span className="font-medium text-muted-foreground italic">
              {card.eventName || "Click to add event name"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEditingChange(card.id)
              }}
            >
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

          <div className="grid grid-cols-2 gap-2">
            {/* Month selector */}
            <Select
              value={currentMonth !== undefined ? currentMonth.toString() : ""}
              onValueChange={(value) => handleMonthUpdate(Number.parseInt(value))}
            >
              <SelectTrigger className="w-full">
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
              className="w-full"
              min="1000"
              max="2100"
              placeholder="Year"
            />
          </div>
        </div>

        {/* Delete button - centered */}
        <div className="flex justify-center pt-2">
          <Button variant="destructive" size="sm" onClick={onRemove} className="flex items-center gap-1">
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
