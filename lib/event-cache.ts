export interface CachedEvent {
  eventName: string
  timestamp: number
}

export function generateCacheKey(fullDate: Date | undefined, filename: string): string {
  if (!fullDate) {
    // Fallback to filename if no date available
    return `file_${filename.replace(/[^a-zA-Z0-9]/g, "_")}`
  }

  // Use full timestamp + filename for maximum specificity
  const timestamp = fullDate.getTime()
  const cleanFilename = filename.replace(/[^a-zA-Z0-9]/g, "_")
  return `${timestamp}_${cleanFilename}`
}

export function saveEventName(cacheKey: string, eventName: string): void {
  try {
    const cached: CachedEvent = {
      eventName,
      timestamp: Date.now(),
    }
    localStorage.setItem(`timeline_event_${cacheKey}`, JSON.stringify(cached))
  } catch (error) {
    console.warn("Failed to save event name to localStorage:", error)
  }
}

export function loadEventName(cacheKey: string): string | null {
  try {
    const cached = localStorage.getItem(`timeline_event_${cacheKey}`)
    if (!cached) return null

    const parsed: CachedEvent = JSON.parse(cached)

    // Return cached event name if it exists and is not empty
    return parsed.eventName || null
  } catch (error) {
    console.warn("Failed to load event name from localStorage:", error)
    return null
  }
}

export function clearOldCache(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): void {
  // Clear cache entries older than 30 days by default
  try {
    const now = Date.now()
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("timeline_event_")) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const parsed: CachedEvent = JSON.parse(cached)
            if (now - parsed.timestamp > maxAgeMs) {
              keysToRemove.push(key)
            }
          }
        } catch {
          // Remove invalid entries
          keysToRemove.push(key)
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))
  } catch (error) {
    console.warn("Failed to clear old cache:", error)
  }
}
