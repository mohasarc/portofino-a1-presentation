import { mkdir, readFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const slideWidth = 1440
const slideHeight = 900
const baseUrl = process.env.DECK_URL ?? 'http://127.0.0.1:5173/'
const outputPath = resolve(process.env.PDF_OUTPUT ?? 'exports/Portofino-A1-Backup.pdf')
const framesDir = resolve(process.env.PDF_FRAMES_DIR ?? '/tmp/portofino-a1-pdf-frames')

const sentences = [
  'Portofino – Ein kleines Paradies in Italien',
  'Portofino liegt in Italien.',
  'Es liegt in der Region Ligurien, an der italienischen Riviera.',
  'Portofino liegt am Meer und ist ein kleines Dorf.',
  'Genua ist ungefähr 30 Kilometer entfernt.',
  'Portofino ist sehr klein.',
  'Dort leben ungefähr 355 Menschen.',
  'Im Sommer kommen sehr viele Touristen.',
  'Sehenswürdigkeiten: San Giorgio, Castello Brown, Leuchtturm.',
  'Pesto ist eine Spezialität aus Ligurien.',
  'Sehr bekannt ist auch Focaccia.',
  'Man kann auch Fisch und Meeresfrüchte essen.',
  'Ein lokales Getränk ist Wein aus Ligurien.',
  'Ich finde Portofino sehr schön.',
  'Es liegt am Meer und hat viele bunte Häuser.',
  'Ich möchte Portofino gerne einmal besuchen.',
  'Vielen Dank für eure Aufmerksamkeit!',
]

await mkdir(resolve('exports'), { recursive: true })
await rm(framesDir, { recursive: true, force: true })
await mkdir(framesDir, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: slideWidth, height: slideHeight }, deviceScaleFactor: 1 })
await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' })

const framePaths = []

try {
  for (let index = 0; index < sentences.length; index += 1) {
    const slideNumber = index + 1
    const url = new URL(baseUrl)
    url.searchParams.set('beat', String(slideNumber))
    url.searchParams.set('static', '1')
    url.searchParams.set('pdf', '1')

    await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForFunction(
      () => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
      undefined,
      { timeout: 30_000 },
    )

    if ([2, 3, 5].includes(slideNumber)) {
      await page.waitForSelector('.map-canvas[data-stage]', { timeout: 30_000 })
      await page.waitForTimeout(2_500)
    }

    const validation = await page.evaluate(({ expected, width, height }) => {
      const visibleTexts = Array.from(document.querySelectorAll('h1, h2'))
        .filter((element) => {
          const style = window.getComputedStyle(element)
          return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0
        })
        .map((element) => element.textContent?.trim())

      const clipped = Array.from(document.querySelectorAll('.sentence h1, .finale-content h1, .landmark-title, .landmark-gallery figcaption'))
        .filter((element) => {
          const rect = element.getBoundingClientRect()
          const style = window.getComputedStyle(element)
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
          return rect.left < -1 || rect.top < -1 || rect.right > width + 1 || rect.bottom > height + 1
        })
        .map((element) => ({ text: element.textContent?.trim(), rect: element.getBoundingClientRect().toJSON() }))

      return {
        sentenceVisible: visibleTexts.includes(expected),
        clipped,
        failedImages: Array.from(document.images)
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
      }
    }, { expected: sentences[index], width: slideWidth, height: slideHeight })

    if (!validation.sentenceVisible) throw new Error(`Slide ${slideNumber}: scripted sentence is not visible`)
    if (validation.failedImages.length) throw new Error(`Slide ${slideNumber}: failed images: ${validation.failedImages.join(', ')}`)
    if (validation.clipped.length) throw new Error(`Slide ${slideNumber}: clipped content: ${JSON.stringify(validation.clipped)}`)

    const framePath = resolve(framesDir, `slide-${String(slideNumber).padStart(2, '0')}.png`)
    await page.screenshot({ path: framePath, type: 'png', animations: 'disabled' })
    framePaths.push(framePath)
    process.stdout.write(`✓ Slide ${String(slideNumber).padStart(2, '0')} loaded and validated\n`)
  }

  const printPage = await browser.newPage({ viewport: { width: slideWidth, height: slideHeight } })
  const images = await Promise.all(framePaths.map(async (path) => `data:image/png;base64,${(await readFile(path)).toString('base64')}`))
  const slideMarkup = images.map((source, index) => `<section class="slide"><img src="${source}" alt="Slide ${index + 1}"></section>`).join('')

  await printPage.setContent(`<!doctype html>
    <html><head><meta charset="utf-8"><style>
      @page { size: 12in 7.5in; margin: 0; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #061d23; }
      .slide { width: 12in; height: 7.5in; margin: 0; break-after: page; page-break-after: always; overflow: hidden; }
      .slide:last-child { break-after: auto; page-break-after: auto; }
      img { display: block; width: 100%; height: 100%; object-fit: fill; }
    </style></head><body>${slideMarkup}</body></html>`, { waitUntil: 'load' })
  await printPage.pdf({ path: outputPath, width: '12in', height: '7.5in', printBackground: true, preferCSSPageSize: true })
  await printPage.close()
  process.stdout.write(`PDF created: ${outputPath}\n`)
} finally {
  await browser.close()
}
