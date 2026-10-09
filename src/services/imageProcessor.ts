import JSZip from 'jszip';
import { ImageFileItem, SupportedFormat } from '../types';

/**
 * Format bytes into human-readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Read image file into an HTMLImageElement
 */
export function loadImageElement(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      img.src = URL.createObjectURL(source);
    }
  });
}

/**
 * Encodes raw ImageData to standard Windows BMP (24-bit RGB) format
 */
export function encodeBMP(imageData: ImageData): Blob {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // Row width in bytes must be multiple of 4
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize; // 14 byte file header + 40 byte DIB header

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // --- BMP Header (14 bytes) ---
  view.setUint16(0, 0x4D42, false); // "BM" in ASCII
  view.setUint32(2, fileSize, true); // File size
  view.setUint16(6, 0, true);        // Reserved
  view.setUint16(8, 0, true);        // Reserved
  view.setUint32(10, 54, true);      // Offset to pixel array

  // --- DIB Header (BITMAPINFOHEADER - 40 bytes) ---
  view.setUint32(14, 40, true);      // Header size
  view.setInt32(18, width, true);    // Width
  view.setInt32(22, height, true);   // Height (positive = bottom-up)
  view.setUint16(26, 1, true);       // Color planes = 1
  view.setUint16(28, 24, true);      // Bits per pixel = 24
  view.setUint32(30, 0, true);       // BI_RGB (no compression)
  view.setUint32(34, pixelArraySize, true); // Image data size
  view.setInt32(38, 2835, true);     // Horiz resolution (72 DPI)
  view.setInt32(42, 2835, true);     // Vert resolution (72 DPI)
  view.setUint32(46, 0, true);       // Colors in palette
  view.setUint32(50, 0, true);       // Important colors

  // --- Pixel Data (Bottom-up, BGR format) ---
  let offset = 54;
  for (let y = height - 1; y >= 0; y--) {
    let rowOffset = offset;
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      view.setUint8(rowOffset, data[srcIdx + 2]);     // Blue
      view.setUint8(rowOffset + 1, data[srcIdx + 1]); // Green
      view.setUint8(rowOffset + 2, data[srcIdx]);     // Red
      rowOffset += 3;
    }
    // Pad remaining row bytes with 0
    const padding = rowSize - (width * 3);
    for (let p = 0; p < padding; p++) {
      view.setUint8(rowOffset + p, 0);
    }
    offset += rowSize;
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

/**
 * Encodes an image into standard Windows ICO container with multi-resolution PNG frames
 */
export async function encodeICO(sourceImg: HTMLImageElement): Promise<Blob> {
  const sizes = [16, 32, 48, 64, 128];
  const pngBlobs: { size: number; blob: Blob; buffer: Uint8Array }[] = [];

  for (const s of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceImg, 0, 0, s, s);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    const buffer = new Uint8Array(await blob.arrayBuffer());
    pngBlobs.push({ size: s, blob, buffer });
  }

  // ICO header: 6 bytes + (16 bytes * numImages)
  const headerSize = 6 + (16 * pngBlobs.length);
  let totalSize = headerSize;
  for (const item of pngBlobs) {
    totalSize += item.buffer.length;
  }

  const outputBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(outputBuffer);

  // ICONDIR Header
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type 1 = ICO
  view.setUint16(4, pngBlobs.length, true); // Number of images

  let currentOffset = headerSize;
  for (let i = 0; i < pngBlobs.length; i++) {
    const item = pngBlobs[i];
    const dirOffset = 6 + (i * 16);

    view.setUint8(dirOffset, item.size >= 256 ? 0 : item.size); // Width
    view.setUint8(dirOffset + 1, item.size >= 256 ? 0 : item.size); // Height
    view.setUint8(dirOffset + 2, 0); // Palette colors
    view.setUint8(dirOffset + 3, 0); // Reserved
    view.setUint16(dirOffset + 4, 1, true); // Color planes
    view.setUint16(dirOffset + 6, 32, true); // Bits per pixel
    view.setUint32(dirOffset + 8, item.buffer.length, true); // Image byte size
    view.setUint32(dirOffset + 12, currentOffset, true); // Offset of image data

    // Copy PNG bytes into outputBuffer
    const targetSlice = new Uint8Array(outputBuffer, currentOffset, item.buffer.length);
    targetSlice.set(item.buffer);

    currentOffset += item.buffer.length;
  }

  return new Blob([outputBuffer], { type: 'image/x-icon' });
}

/**
 * Vectorizes/embeds image into an SVG wrapper with scalable vector viewBox
 */
export function encodeSVG(img: HTMLImageElement, canvas: HTMLCanvasElement): Blob {
  const dataUrl = canvas.toDataURL('image/png');
  const w = canvas.width;
  const h = canvas.height;
  
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <title>Converted by PixelForge AI</title>
  <image width="${w}" height="${h}" xlink:href="${dataUrl}" />
</svg>`;

  return new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
}

/**
 * Main conversion & compression processor running 100% on the client
 */
export async function processImage(
  item: ImageFileItem,
  overrideFormat?: SupportedFormat,
  overrideQuality?: number,
  overrideScale?: number
): Promise<{
  blob: Blob;
  url: string;
  width: number;
  height: number;
  size: number;
  timeMs: number;
}> {
  const startTime = performance.now();
  const format = overrideFormat || item.targetFormat;
  const qualityPercent = overrideQuality !== undefined ? overrideQuality : item.quality;
  const quality = Math.max(0.01, Math.min(1.0, qualityPercent / 100));
  const scalePercent = overrideScale !== undefined ? overrideScale : item.scalePercent;
  const scale = Math.max(0.05, Math.min(1.0, scalePercent / 100));

  const img = await loadImageElement(item.previewUrl);

  let targetWidth = Math.round(img.naturalWidth * scale);
  let targetHeight = Math.round(img.naturalHeight * scale);

  if (item.maxWidth && targetWidth > item.maxWidth) {
    const ratio = item.maxWidth / targetWidth;
    targetWidth = item.maxWidth;
    targetHeight = Math.round(targetHeight * ratio);
  }

  if (item.maxHeight && targetHeight > item.maxHeight) {
    const ratio = item.maxHeight / targetHeight;
    targetHeight = item.maxHeight;
    targetWidth = Math.round(targetWidth * ratio);
  }

  // Draw to offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If format doesn't support transparency (e.g. JPEG), fill white background
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  let resultBlob: Blob;

  if (format === 'image/bmp') {
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    resultBlob = encodeBMP(imgData);
  } else if (format === 'image/x-icon') {
    resultBlob = await encodeICO(img);
  } else if (format === 'image/svg+xml') {
    resultBlob = encodeSVG(img, canvas);
  } else {
    // Standard formats: PNG, JPEG, WEBP, AVIF
    resultBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) {
            resolve(b);
          } else {
            // Fallback for AVIF if not supported by browser encoder
            if (format === 'image/avif') {
              canvas.toBlob(
                (fallbackBlob) => fallbackBlob ? resolve(fallbackBlob) : reject(new Error('Encoding failed')),
                'image/webp',
                quality
              );
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          }
        },
        format,
        quality
      );
    });
  }

  const endTime = performance.now();
  const timeMs = Math.round(endTime - startTime);
  const resultUrl = URL.createObjectURL(resultBlob);

  return {
    blob: resultBlob,
    url: resultUrl,
    width: targetWidth,
    height: targetHeight,
    size: resultBlob.size,
    timeMs
  };
}

/**
 * Package multiple processed images into a single zip archive
 */
export async function createZipArchive(items: ImageFileItem[]): Promise<Blob> {
  const zip = new JSZip();

  items.forEach((item, index) => {
    if (item.resultBlob) {
      let ext = 'png';
      switch (item.targetFormat) {
        case 'image/jpeg': ext = 'jpg'; break;
        case 'image/webp': ext = 'webp'; break;
        case 'image/avif': ext = 'avif'; break;
        case 'image/bmp': ext = 'bmp'; break;
        case 'image/x-icon': ext = 'ico'; break;
        case 'image/svg+xml': ext = 'svg'; break;
      }

      const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      const fileName = `${baseName}_converted_${index + 1}.${ext}`;
      zip.file(fileName, item.resultBlob);
    }
  });

  return await zip.generateAsync({ type: 'blob' });
}
