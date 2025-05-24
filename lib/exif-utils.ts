import ExifReader from "exifreader"

export async function extractExifDate(file: File): Promise<{ year: number; fullDate?: Date; source: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const tags = ExifReader.load(arrayBuffer)

    console.log(`EXIF data for ${file.name}:`, tags)

    const dateFields = ["DateTimeOriginal", "DateTime", "DateTimeDigitized", "CreateDate", "ModifyDate"]

    for (const field of dateFields) {
      if (tags[field]) {
        try {
          let dateStr: string

          if (tags[field].description) {
            dateStr = tags[field].description
          } else if (tags[field].value) {
            dateStr = Array.isArray(tags[field].value) ? tags[field].value[0] : tags[field].value
          } else {
            continue
          }

          console.log(`Found ${field}:`, dateStr)

          let date: Date

          if (typeof dateStr === "string" && dateStr.includes(":") && dateStr.length >= 19) {
            const isoDateStr = dateStr.substring(0, 19).replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")
            date = new Date(isoDateStr)
          } else {
            date = new Date(dateStr)
          }

          if (!isNaN(date.getTime())) {
            console.log(`Successfully parsed date from ${field}:`, date)
            return {
              year: date.getFullYear(),
              fullDate: date,
              source: `EXIF ${field}`,
            }
          }
        } catch (error) {
          console.warn(`Error parsing ${field}:`, error)
        }
      }
    }

    const fallbackDate = new Date(file.lastModified)
    console.log(`No EXIF date found, using file modification date:`, fallbackDate)
    return {
      year: fallbackDate.getFullYear(),
      fullDate: fallbackDate,
      source: "File modification date",
    }
  } catch (error) {
    console.error("Error reading EXIF data:", error)
    const fallbackDate = new Date(file.lastModified)
    return {
      year: fallbackDate.getFullYear(),
      fullDate: fallbackDate,
      source: "File modification date (EXIF error)",
    }
  }
}
