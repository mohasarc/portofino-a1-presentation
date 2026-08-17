import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { assetPath, deck, imageSources, type Beat, type MapStage } from './deck'

const LAST_BEAT = deck.beats.length - 1
const cinematicEase = [0.76, 0, 0.2, 1] as const

const mapTargets: Record<MapStage, { scale: number; x: number; y: number }> = {
  italy: { scale: 3.45, x: -135, y: 430 },
  liguria: { scale: 7.2, x: -292, y: 900 },
  genoa: { scale: 6.15, x: -190, y: 760 },
  portofino: { scale: 12.4, x: -505, y: 1555 },
}

function sentenceWithAccent(sentence: string, accent?: string) {
  if (!accent || !sentence.includes(accent)) return sentence
  const [before, after] = sentence.split(accent)
  return <>{before}<em>{accent}</em>{after}</>
}

function MapJourney({ beat, reducedMotion }: { beat: Beat; reducedMotion: boolean }) {
  const target = mapTargets[beat.mapStage ?? 'italy']
  const arriving = beat.id === 'italien'
  const dissolving = beat.id === 'dorf-am-meer'

  const camera = reducedMotion
    ? target
    : arriving
      ? {
          scale: [0.78, 1.35, 2.15, target.scale],
          x: [0, -18, -64, target.x],
          y: [0, 120, 310, target.y],
        }
      : target

  return (
    <motion.div
      className="map-layer"
      initial={false}
      animate={{ opacity: dissolving ? (reducedMotion ? 0 : [1, 1, 0]) : beat.kind === 'map' ? 1 : 0 }}
      transition={dissolving ? { duration: 2.4, times: [0, 0.52, 1] } : { duration: 0.7 }}
      aria-hidden="true"
    >
      <div className="map-sea" />
      <motion.div
        className="map-camera"
        animate={camera}
        transition={reducedMotion ? { duration: 0 } : { duration: arriving ? 4.2 : 1.7, ease: cinematicEase }}
      >
        <img src={assetPath('world.svg')} alt="" />
        <span className="map-point map-point--portofino" />
      </motion.div>

      {arriving && !reducedMotion && (
        <div className="map-journey-labels">
          {['Welt', 'Europa', 'Italien'].map((label, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -8] }}
              transition={{ duration: 1.35, delay: i * 1.12, times: [0, 0.2, 0.78, 1] }}
            >
              {label}
            </motion.span>
          ))}
        </div>
      )}

      {beat.mapStage === 'liguria' && (
        <motion.div className="map-place" initial={reducedMotion ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: reducedMotion ? 0 : 1.05, type: 'spring', stiffness: 190, damping: 18 }}>
          <span />
          <strong>Ligurien</strong>
          <small>Italienische Riviera</small>
        </motion.div>
      )}

      {beat.mapStage === 'genoa' && (
        <motion.div className="route-map" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reducedMotion ? 0 : 0.55 }}>
          <span className="route-map__city route-map__city--genoa">Genua</span>
          <svg viewBox="0 0 500 180" aria-hidden="true">
            <motion.path d="M70 58 C190 12 300 152 430 112" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.35, delay: 0.55, ease: cinematicEase }} />
          </svg>
          <span className="route-map__city route-map__city--portofino">Portofino</span>
          <strong>≈ 30 km</strong>
        </motion.div>
      )}

      {dissolving && (
        <motion.div className="arrival-pin" initial={reducedMotion ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: reducedMotion ? 0 : 0.45, type: 'spring', stiffness: 180, damping: 16 }}>
          Portofino
          <small>44.30° N · 9.21° E</small>
        </motion.div>
      )}
    </motion.div>
  )
}

function PhotoBackground({ beat, parallaxX, parallaxY, reducedMotion }: {
  beat: Beat
  parallaxX: ReturnType<typeof useTransform<number, number>>
  parallaxY: ReturnType<typeof useTransform<number, number>>
  reducedMotion: boolean
}) {
  const isArrival = beat.id === 'dorf-am-meer'
  const crop = beat.crop ?? { scale: 1.1, x: 0, y: 0 }

  return (
    <AnimatePresence mode="sync" initial={false}>
      {beat.media && (
        <motion.div
          className="photo-layer"
          key={beat.media}
          initial={{ opacity: 0 }}
          animate={{ opacity: isArrival ? (reducedMotion ? 1 : [0, 0, 1]) : 1 }}
          exit={{ opacity: 0 }}
          transition={isArrival ? { duration: 2.4, times: [0, 0.48, 1] } : { duration: 0.95 }}
        >
          <motion.div className="photo-parallax" style={{ x: parallaxX, y: parallaxY }}>
            <motion.img
              src={beat.media}
              alt=""
              animate={{
                scale: reducedMotion ? crop.scale : [crop.scale, crop.scale + 0.055],
                x: reducedMotion ? crop.x : [crop.x, crop.x - 12],
                y: reducedMotion ? crop.y : [crop.y, crop.y - 8],
              }}
              transition={{ duration: 9, ease: 'linear' }}
            />
          </motion.div>
          <div className={`photo-shade photo-shade--${beat.align ?? 'left'}`} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LandmarkGallery({ active }: { active: boolean }) {
  const landmarks = [
    { name: 'San Giorgio', image: assetPath('san-giorgio.jpg'), position: 'center' },
    { name: 'Castello Brown', image: assetPath('castello-brown.jpg'), position: 'center' },
    { name: 'Leuchtturm', image: assetPath('lighthouse.jpg'), position: 'center' },
  ]

  return (
    <div className="landmark-gallery" aria-hidden="true">
      {landmarks.map((landmark, index) => (
        <motion.figure
          key={landmark.name}
          initial={false}
          animate={active ? { clipPath: 'inset(0 0 0 0)', y: 0 } : { clipPath: 'inset(100% 0 0 0)', y: 42 }}
          transition={{ duration: 0.9, delay: index * 0.13, ease: cinematicEase }}
        >
          <motion.img src={landmark.image} alt="" animate={{ scale: active ? 1.06 : 1.18 }} transition={{ duration: 5.5, ease: 'linear' }} style={{ objectPosition: landmark.position }} />
          <figcaption><span>0{index + 1}</span>{landmark.name}</figcaption>
        </motion.figure>
      ))}
    </div>
  )
}

function SceneContent({ beat, musicOn, setMusicOn, reducedMotion }: {
  beat: Beat
  musicOn: boolean
  setMusicOn: (value: boolean) => void
  reducedMotion: boolean
}) {
  if (beat.kind === 'landmarks') {
    return (
      <>
        <LandmarkGallery active />
        <motion.div className="landmark-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
          <span>Sehenswürdigkeiten</span>
          <h2>San Giorgio.<br />Castello Brown.<br />Leuchtturm.</h2>
        </motion.div>
      </>
    )
  }

  if (beat.kind === 'finale') {
    return (
      <motion.div className="finale-content" initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reducedMotion ? 0 : 1.2, ease: cinematicEase }}>
        <p>Portofino</p>
        <h1>{beat.sentence}</h1>
        <button className="music-toggle" type="button" onClick={() => setMusicOn(!musicOn)} aria-pressed={musicOn}>
          <span className={musicOn ? 'music-bars is-playing' : 'music-bars'} aria-hidden="true"><i /><i /><i /><i /></span>
          {musicOn ? 'Musik läuft · Dalida' : 'Musik starten · Dalida'}
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`sentence sentence--${beat.align ?? 'left'} sentence--${beat.kind}`}
      initial={reducedMotion ? false : { opacity: 0, y: 34 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -26 }}
      transition={{ duration: 0.72, delay: beat.kind === 'map' ? 0.72 : 0.28, ease: cinematicEase }}
    >
      <span className="sentence__section">{beat.section}</span>
      {beat.kind === 'stat' && <strong className="sentence__stat">{beat.stat}</strong>}
      <h1>{sentenceWithAccent(beat.sentence, beat.accent)}</h1>
      {beat.kind === 'tourism' && (
        <div className="tourist-flow" aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => (
            <motion.i key={i} initial={{ opacity: 0, x: -60 }} animate={{ opacity: [0, 1, 0.8], x: 0 }} transition={{ delay: 0.35 + i * 0.035, type: 'spring', stiffness: 160, damping: 18 }} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function Credits({ onClose }: { onClose: () => void }) {
  return (
    <motion.aside className="credits" role="dialog" aria-modal="true" aria-label="Bildnachweise" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
      <button type="button" onClick={onClose} aria-label="Bildnachweise schließen">×</button>
      <p className="credits__eyebrow">Bildnachweise</p>
      <h2>Echte Orte.<br />Offene Bilder.</h2>
      <div className="credits__list">
        {imageSources.map((source) => (
          <a key={source.label} href={source.url} target="_blank" rel="noreferrer">
            <strong>{source.label}</strong>
            <span>{source.author} · Wikimedia Commons ↗</span>
          </a>
        ))}
      </div>
      <p className="credits__music">Musik: “Love in Portofino” · Dalida, eingebettet über den offiziellen YouTube-Kanal.</p>
    </motion.aside>
  )
}

export default function App() {
  const initialParams = new URLSearchParams(window.location.search)
  const initialBeat = Number(initialParams.get('beat'))
  const staticMode = initialParams.has('static')
  const [index, setIndex] = useState(Number.isFinite(initialBeat) ? Math.max(0, Math.min(LAST_BEAT, initialBeat - 1)) : 0)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [creditsOpen, setCreditsOpen] = useState(false)
  const wheelLock = useRef(false)
  const swipeStart = useRef<number | null>(null)
  const reducedMotion = Boolean(useReducedMotion()) || staticMode

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 48, damping: 20, mass: 0.85 })
  const smoothY = useSpring(pointerY, { stiffness: 48, damping: 20, mass: 0.85 })
  const parallaxX = useTransform(smoothX, (v) => v * -1)
  const parallaxY = useTransform(smoothY, (v) => v * -1)

  const beat = deck.beats[index]
  const isMapVisible = beat.kind === 'map' || beat.id === 'dorf-am-meer'
  const progress = ((index + 1) / deck.beats.length) * 100

  const usedMedia = useMemo(() => Array.from(new Set(deck.beats.flatMap((item) => item.media ? [item.media] : []))), [])

  const goTo = useCallback((next: number) => {
    const destination = Math.max(0, Math.min(LAST_BEAT, next))
    setHasInteracted(true)
    if (destination === LAST_BEAT) setMusicOn(true)
    setIndex(destination)
  }, [])

  useEffect(() => {
    usedMedia.forEach((src) => { const image = new Image(); image.src = src })
  }, [usedMedia])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (creditsOpen && event.key === 'Escape') { setCreditsOpen(false); return }
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(event.key)) {
        event.preventDefault(); setHasInteracted(true); setIndex((current) => {
          const destination = Math.min(LAST_BEAT, current + 1)
          if (destination === LAST_BEAT) setMusicOn(true)
          return destination
        })
      }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
        event.preventDefault(); setHasInteracted(true); setIndex((current) => Math.max(0, current - 1))
      }
      if (event.key.toLowerCase() === 'r') { setHasInteracted(true); setIndex(0) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [creditsOpen])

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('beat', String(index + 1))
    window.history.replaceState({}, '', url)

    if (index === LAST_BEAT && hasInteracted) setMusicOn(true)
    if (index !== LAST_BEAT) setMusicOn(false)
  }, [index, hasInteracted])

  return (
    <main
      className={`journey journey--${beat.kind}`}
      onPointerMove={(event) => {
        pointerX.set((event.clientX / window.innerWidth - 0.5) * 24)
        pointerY.set((event.clientY / window.innerHeight - 0.5) * 18)
      }}
      onPointerDown={(event) => { swipeStart.current = event.clientX }}
      onPointerUp={(event) => {
        if (swipeStart.current === null) return
        const distance = event.clientX - swipeStart.current
        if (Math.abs(distance) > 55) goTo(index + (distance < 0 ? 1 : -1))
        swipeStart.current = null
      }}
      onWheel={(event) => {
        if (wheelLock.current || Math.abs(event.deltaY) < 12) return
        wheelLock.current = true
        goTo(index + (event.deltaY > 0 ? 1 : -1))
        window.setTimeout(() => { wheelLock.current = false }, 820)
      }}
    >
      <div className="stage" aria-hidden="true">
        <PhotoBackground beat={beat} parallaxX={parallaxX} parallaxY={parallaxY} reducedMotion={reducedMotion} />
        <MapJourney beat={beat} reducedMotion={reducedMotion} />
        {beat.kind === 'landmarks' && <div className="landmark-ground" />}
        <div className="grain" />
      </div>

      <AnimatePresence mode="wait">
        <SceneContent key={beat.id} beat={beat} musicOn={musicOn} setMusicOn={setMusicOn} reducedMotion={reducedMotion} />
      </AnimatePresence>

      {index === LAST_BEAT && musicOn && (
        <iframe
          className="music-embed"
          title="Love in Portofino by Dalida"
          src="https://www.youtube.com/embed/AKDLoUSaPV8?autoplay=1&controls=0&loop=1&playlist=AKDLoUSaPV8"
          allow="autoplay; encrypted-media"
        />
      )}

      <header className="topline">
        <span>Deutsch A1</span>
        <span>44.303° N · 9.210° E</span>
        <button type="button" onClick={() => setCreditsOpen(true)}>Bildnachweise</button>
      </header>

      <nav className="journey-nav" aria-label="Präsentationssteuerung">
        <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Zurück">←</button>
        <div className="journey-nav__meta">
          <span>{beat.section}</span>
          <div className="journey-nav__track"><motion.i animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: cinematicEase }} /></div>
        </div>
        <span className="journey-nav__count">{String(index + 1).padStart(2, '0')} / {deck.beats.length}</span>
        <button type="button" onClick={() => goTo(index + 1)} disabled={index === LAST_BEAT} aria-label="Weiter">→</button>
      </nav>

      <AnimatePresence>{creditsOpen && <Credits onClose={() => setCreditsOpen(false)} />}</AnimatePresence>
      <p className="sr-only" role="status">{`Station ${index + 1} von ${deck.beats.length}: ${beat.sentence}`}</p>
    </main>
  )
}
