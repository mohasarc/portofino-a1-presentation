import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Feature, LineString } from 'geojson'
import { assetPath, deck, imageSources, type Beat, type MapStage } from './deck'

const LAST_BEAT = deck.beats.length - 1
const cinematicEase = [0.76, 0, 0.2, 1] as const

type Coordinates = [number, number]
type MapView = { center: Coordinates; zoom: number; bearing?: number; pitch?: number }

const PORTOFINO: Coordinates = [9.2094, 44.3032]
const GENOA: Coordinates = [8.9463, 44.4056]

const mapViews: Record<'world' | 'europe' | MapStage, MapView> = {
  world: { center: [7, 24], zoom: 0.65 },
  europe: { center: [11, 49], zoom: 3.15 },
  italy: { center: [12.35, 42.55], zoom: 5.1 },
  liguria: { center: [8.95, 44.28], zoom: 8.1 },
  genoa: { center: [9.08, 44.35], zoom: 9.65 },
  portofino: { center: PORTOFINO, zoom: 13.3, bearing: -12, pitch: 38 },
}

const genoaRoute: Feature<LineString> = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: [GENOA, PORTOFINO] },
}

function sentenceWithAccent(sentence: string, accent?: string) {
  if (!accent || !sentence.includes(accent)) return sentence
  const [before, after] = sentence.split(accent)
  return <>{before}<em>{accent}</em>{after}</>
}

function MapJourney({ beat, reducedMotion }: { beat: Beat; reducedMotion: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const arriving = beat.id === 'italien'
  const dissolving = beat.id === 'dorf-am-meer'

  useEffect(() => {
    if (!containerRef.current) return

    const markers: Marker[] = []
    let disposed = false
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/fiord',
      ...mapViews.world,
      attributionControl: false,
      interactive: false,
      renderWorldCopies: false,
      fadeDuration: 0,
    })

    mapRef.current = map
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')
    map.once('style.load', () => {
      if (disposed) return
      map.addSource('genoa-route', { type: 'geojson', data: genoaRoute })
      map.addLayer({
        id: 'genoa-route-line',
        type: 'line',
        source: 'genoa-route',
        layout: { visibility: 'none', 'line-cap': 'round' },
        paint: {
          'line-color': '#ef684f',
          'line-width': 4,
          'line-dasharray': [1.2, 2.2],
        },
      })

      const makeMarker = (name: string, coordinates: Coordinates, modifier: string) => {
        const element = document.createElement('div')
        const dot = document.createElement('span')
        const label = document.createElement('strong')
        element.className = `geo-marker geo-marker--${modifier}`
        label.textContent = name
        element.append(dot, label)
        const marker = new maplibregl.Marker({ element, anchor: 'center' }).setLngLat(coordinates).addTo(map)
        markers.push(marker)
      }

      makeMarker('Portofino', PORTOFINO, 'portofino')
      makeMarker('Genua', GENOA, 'genoa')
      setMapReady(true)
    })

    return () => {
      disposed = true
      markers.forEach((marker) => marker.remove())
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const container = containerRef.current
    if (!map || !container || !mapReady) return

    const stage = beat.id === 'paradies' ? 'world' : (beat.mapStage ?? 'italy')
    container.dataset.stage = stage
    map.setLayoutProperty('genoa-route-line', 'visibility', stage === 'genoa' ? 'visible' : 'none')

    const move = (view: MapView, duration: number) => {
      if (reducedMotion) map.jumpTo(view)
      else map.flyTo({ ...view, duration, essential: false })
    }

    const timers: number[] = []
    if (arriving && !reducedMotion) {
      container.dataset.stage = 'world'
      map.jumpTo(mapViews.world)
      timers.push(window.setTimeout(() => {
        container.dataset.stage = 'europe'
        move(mapViews.europe, 1350)
      }, 180))
      timers.push(window.setTimeout(() => {
        container.dataset.stage = 'italy'
        move(mapViews.italy, 1650)
      }, 1650))
    } else if (stage === 'genoa') {
      if (reducedMotion) {
        map.jumpTo(mapViews.genoa)
      } else {
        map.fitBounds([[8.88, 44.265], [9.275, 44.45]], {
          padding: { top: 130, right: 130, bottom: 170, left: 130 },
          duration: 1800,
          bearing: 0,
          pitch: 0,
        })
      }
    } else {
      move(mapViews[stage], stage === 'portofino' ? 2100 : 1700)
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [arriving, beat.id, beat.mapStage, mapReady, reducedMotion])

  return (
    <motion.div
      className="map-layer"
      initial={false}
      animate={{ opacity: dissolving ? (reducedMotion ? 0 : [1, 1, 0]) : beat.kind === 'map' ? 1 : 0 }}
      transition={dissolving ? { duration: 2.4, times: [0, 0.52, 1] } : { duration: 0.7 }}
      aria-hidden="true"
    >
      <div ref={containerRef} className="map-canvas" />
      <div className="map-cinematic-tint" />

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
          <figcaption>{landmark.name}</figcaption>
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
        <div className="landmark-title-wrap">
          <motion.h2
            className="landmark-title"
            initial={reducedMotion ? false : { opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : 0.38, duration: reducedMotion ? 0 : 0.7, ease: cinematicEase }}
          >
            {beat.sentence}
          </motion.h2>
        </div>
      </>
    )
  }

  if (beat.kind === 'finale') {
    return (
      <motion.div className="finale-content" initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reducedMotion ? 0 : 1.2, ease: cinematicEase }}>
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
      className={`sentence sentence--${beat.align ?? 'left'} sentence--${beat.kind} sentence--${beat.id}`}
      initial={reducedMotion ? false : { opacity: 0, y: 34 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -26 }}
      transition={{ duration: 0.72, delay: beat.kind === 'map' ? 0.72 : 0.28, ease: cinematicEase }}
    >
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

      <nav className="journey-nav" aria-label="Präsentationssteuerung">
        <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Zurück">←</button>
        <div className="journey-nav__track"><motion.i animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: cinematicEase }} /></div>
        <span className="journey-nav__count">{String(index + 1).padStart(2, '0')} / {deck.beats.length}</span>
        <button type="button" onClick={() => goTo(index + 1)} disabled={index === LAST_BEAT} aria-label="Weiter">→</button>
        <button className="credits-trigger" type="button" onClick={() => setCreditsOpen(true)} aria-label="Bildnachweise" title="Bildnachweise">ⓘ</button>
      </nav>

      <AnimatePresence>{creditsOpen && <Credits onClose={() => setCreditsOpen(false)} />}</AnimatePresence>
      <p className="sr-only" role="status">{`Station ${index + 1} von ${deck.beats.length}: ${beat.sentence}`}</p>
    </main>
  )
}
