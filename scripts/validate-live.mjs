import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const baseUrl = process.env.DECK_URL ?? 'http://127.0.0.1:5173/'
const artifactsDir = resolve(process.env.VALIDATION_DIR ?? '/tmp/portofino-live-validation')

await mkdir(artifactsDir, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const pageErrors = []

page.on('pageerror', (error) => pageErrors.push(error.message))

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await page.waitForSelector('.preload-gate', { state: 'visible' })

  await page.keyboard.press('ArrowRight')
  const blockedBeat = await page.locator('.journey-nav__count').textContent()
  if (blockedBeat?.trim() !== '01 / 17') throw new Error('Navigation was active before the preload gate was dismissed.')

  await page.waitForFunction(
    () => document.querySelectorAll('.preload-gate__check.is-ready').length === 4,
    undefined,
    { timeout: 90_000 },
  )

  const preload = await page.evaluate(() => {
    const audio = document.querySelector('audio')
    const mapResources = performance.getEntriesByType('resource')
      .filter((entry) => /openfreemap|openmaptiles|maplibre/.test(entry.name))
    return {
      buttonEnabled: !(document.querySelector('.preload-gate__start'))?.hasAttribute('disabled'),
      audioSource: audio?.currentSrc,
      audioReadyState: audio?.readyState,
      audioDuration: audio?.duration,
      mapResourceCount: mapResources.length,
      mapStage: document.querySelector('.map-canvas')?.getAttribute('data-stage'),
      iframeCount: document.querySelectorAll('iframe').length,
      youtubeReferences: document.documentElement.innerHTML.toLowerCase().includes('youtube'),
    }
  })

  if (!preload.buttonEnabled) throw new Error('The Start button did not unlock after all readiness checks passed.')
  if (!preload.audioSource?.startsWith('blob:')) throw new Error('Audio was not fully fetched into a local browser blob.')
  if ((preload.audioReadyState ?? 0) < 3) throw new Error(`Audio is not ready to play (readyState ${preload.audioReadyState}).`)
  if (!Number.isFinite(preload.audioDuration) || preload.audioDuration < 20) throw new Error('The official audio preview did not decode correctly.')
  if (preload.mapStage !== 'world') throw new Error('The preloaded map did not return to its opening world stage.')
  if (preload.iframeCount !== 0 || preload.youtubeReferences) throw new Error('A YouTube or iframe embed is still present.')

  await page.screenshot({ path: resolve(artifactsDir, 'preload-ready.png'), type: 'png', animations: 'disabled' })
  await page.getByRole('button', { name: 'Präsentation starten' }).click()
  await page.waitForSelector('.preload-gate', { state: 'detached' })

  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => document.querySelector('.map-canvas')?.getAttribute('data-stage') === 'italy')
  await page.screenshot({ path: resolve(artifactsDir, 'map-immediate.png'), type: 'png', animations: 'disabled' })

  for (let slide = 2; slide < 17; slide += 1) {
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(70)
  }

  await page.waitForFunction(() => {
    const audio = document.querySelector('audio')
    return Boolean(audio && !audio.paused && audio.currentTime > 0.25)
  }, undefined, { timeout: 8_000 })

  await page.screenshot({ path: resolve(artifactsDir, 'finale-audio-playing.png'), type: 'png', animations: 'disabled' })

  if (pageErrors.length) throw new Error(`Browser errors: ${pageErrors.join(' | ')}`)
  process.stdout.write(`✓ Preload gate waited for images, map regions, fonts, and audio\n`)
  process.stdout.write(`✓ Audio decoded from a browser-memory blob (${Math.round(preload.audioDuration)} seconds)\n`)
  process.stdout.write(`✓ Map was immediately visible after Start (${preload.mapResourceCount} network resources observed; cache allowed)\n`)
  process.stdout.write(`✓ Finale audio played without an iframe or YouTube\n`)
} finally {
  await browser.close()
}
