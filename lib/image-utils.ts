export function cropImageTo3x4(img: HTMLImageElement, targetWidth: number, targetHeight: number): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  const scale = 3
  canvas.width = targetWidth * scale
  canvas.height = targetHeight * scale

  const targetAspectRatio = 3 / 4
  const imgAspectRatio = img.width / img.height

  let sourceX = 0
  let sourceY = 0
  let sourceWidth = img.width
  let sourceHeight = img.height

  if (imgAspectRatio > targetAspectRatio) {
    sourceWidth = img.height * targetAspectRatio
    sourceX = (img.width - sourceWidth) / 2
  } else {
    sourceHeight = img.width / targetAspectRatio
    sourceY = (img.height - sourceHeight) / 2
  }

  // Draw the image
  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)

  // Convert to black and white
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    // Calculate grayscale value using luminance formula
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])

    // Set RGB to the same grayscale value
    data[i] = gray // Red
    data[i + 1] = gray // Green
    data[i + 2] = gray // Blue
    // Alpha (data[i + 3]) stays the same
  }

  // Put the modified image data back
  ctx.putImageData(imageData, 0, 0)

  return canvas.toDataURL("image/jpeg", 0.85)
}

export function createRotatedBWImage(img: HTMLImageElement, targetWidth: number, targetHeight: number): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  const scale = 3
  canvas.width = targetWidth * scale
  canvas.height = targetHeight * scale

  const targetAspectRatio = 3 / 4
  const imgAspectRatio = img.width / img.height

  let sourceX = 0
  let sourceY = 0
  let sourceWidth = img.width
  let sourceHeight = img.height

  if (imgAspectRatio > targetAspectRatio) {
    sourceWidth = img.height * targetAspectRatio
    sourceX = (img.width - sourceWidth) / 2
  } else {
    sourceHeight = img.width / targetAspectRatio
    sourceY = (img.height - sourceHeight) / 2
  }

  // Draw the image rotated 180 degrees
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(Math.PI)
  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height,
  )

  // Convert to black and white
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    // Calculate grayscale value using luminance formula
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])

    // Set RGB to the same grayscale value
    data[i] = gray // Red
    data[i + 1] = gray // Green
    data[i + 2] = gray // Blue
    // Alpha (data[i + 3]) stays the same
  }

  // Put the modified image data back
  ctx.putImageData(imageData, 0, 0)

  return canvas.toDataURL("image/jpeg", 0.85)
}
