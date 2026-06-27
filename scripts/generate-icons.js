/**
 * generate-icons.js
 *
 * Creates placeholder PNG icon files for the Chrome extension manifest.
 * Generates solid-colored squares with a simple "note card" design.
 *
 * Usage:  node scripts/generate-icons.js
 *
 * No external dependencies — uses only Node.js built-in modules.
 * Replace these icons with proper branding before publishing.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import zlib from 'zlib'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ── CRC32 (required for PNG chunks) ──────────────────────────────────────────

const crcTable = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[i] = c
}

function crc32(buf) {
  let crc = -1
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ -1) >>> 0
}

// ── PNG builder ──────────────────────────────────────────────────────────────

function createChunk(type, data) {
  const typeBytes = Buffer.from(type)
  const typeData = Buffer.concat([typeBytes, data])
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeData))
  return Buffer.concat([length, typeData, crc])
}

function createPNG(size, colorFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR — image header
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0) // width
  ihdrData.writeUInt32BE(size, 4) // height
  ihdrData[8] = 8 // bit depth
  ihdrData[9] = 2 // color type: RGB
  ihdrData[10] = 0 // compression
  ihdrData[11] = 0 // filter
  ihdrData[12] = 0 // interlace
  const ihdr = createChunk('IHDR', ihdrData)

  // Image pixel data
  const rowSize = 1 + size * 3
  const rawData = Buffer.alloc(size * rowSize)

  for (let y = 0; y < size; y++) {
    rawData[y * rowSize] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = colorFn(x, y, size)
      const offset = y * rowSize + 1 + x * 3
      rawData[offset] = r
      rawData[offset + 1] = g
      rawData[offset + 2] = b
    }
  }

  const compressed = zlib.deflateSync(rawData)
  const idat = createChunk('IDAT', compressed)
  const iend = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

// ── Icon design: purple "note card" ──────────────────────────────────────────

const VIOLET = [124, 58, 237] // #7c3aed
const WHITE = [255, 255, 255]

function iconPixel(x, y, size) {
  const m = Math.max(2, Math.floor(size * 0.18)) // margin
  const isInside =
    x >= m && x < size - m && y >= m && y < size - m
  return isInside ? WHITE : VIOLET
}

// ── Generate icons ───────────────────────────────────────────────────────────

const ICON_SIZES = [16, 32, 48, 128]
const iconsDir = resolve(__dirname, '..', 'public', 'icons')

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true })
}

for (const size of ICON_SIZES) {
  const png = createPNG(size, iconPixel)
  const filePath = resolve(iconsDir, `icon${size}.png`)
  writeFileSync(filePath, png)
  console.log(`  ✓  Created icon${size}.png`)
}

console.log('\nIcons generated in public/icons/')
console.log('Replace with proper branding before publishing to the Chrome Web Store.')
