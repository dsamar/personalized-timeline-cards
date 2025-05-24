"use client"

import { useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { useDropzone } from "react-dropzone"
import type { TimelineCard } from "@/types/timeline-card"
import { extractExifDate } from "@/lib/exif-utils"
import { generateCacheKey, loadEventName, clearOldCache } from "@/lib/event-cache"

interface UploadSectionProps {
  cards: TimelineCard[]
  onCardsAdd: (cards: TimelineCard[]) => void
}

export function UploadSection({ cards, onCardsAdd }: UploadSectionProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Clear old cache entries on upload
      clearOldCache()

      const newCards: TimelineCard[] = []

      for (const file of acceptedFiles) {
        if (file.type.startsWith("image/")) {
          const dateInfo = await extractExifDate(file)
          const imageUrl = URL.createObjectURL(file)

          // Generate cache key and try to load existing event name
          const cacheKey = generateCacheKey(dateInfo.fullDate, file.name)
          const cachedEventName = loadEventName(cacheKey)

          newCards.push({
            id: Math.random().toString(36).substr(2, 9),
            image: imageUrl,
            filename: file.name,
            eventName: cachedEventName || "", // Use cached name if available
            year: dateInfo.year,
            fullDate: dateInfo.fullDate,
            dateSource: dateInfo.source,
          })
        }
      }

      onCardsAdd(newCards)
    },
    [onCardsAdd],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    },
    maxFiles: 25,
  })

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Images ({cards.length}/25)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p>Drop the images here...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">Drag & drop images here, or click to select</p>
              <p className="text-sm text-muted-foreground">
                Supports JPEG, PNG, GIF, BMP, WebP. We'll read EXIF data for dates.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
