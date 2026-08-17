# Portofino — eine filmische Deutsch-A1-Reise

Eine fotografische Web-Präsentation, die sich wie eine durchgehende Kamerafahrt anfühlt: eine geografisch präzise MapLibre-Reise von der Welt → Europa → Italien → Ligurien → Portofino, danach Küste, Dorf, Menschen, Sehenswürdigkeiten, Essen und persönliche Meinung.

Die Seite wird bei jedem Push auf `main` automatisch über GitHub Pages veröffentlicht.

[Präsentation öffnen](https://mohasarc.github.io/portofino-a1-presentation/)

## Start

```bash
npm install
npm run dev
```

Steuerung: Pfeiltasten, Leertaste, Mausrad, Wischgeste oder die Pfeile unten rechts. `R` startet die Reise neu. Mit `?beat=9` kann direkt zu einer Station gesprungen werden.

## Präsentationsprinzip

Alle 17 vorgegebenen Sätze stehen einzeln in `src/deck.ts`. Verwandte Stationen teilen dieselbe Bildwelt, sodass beim Weitergehen keine klassischen Folienwechsel entstehen. Framer Motion steuert Karten-Zooms, Bild-Parallax, Ken-Burns-Bewegung, Übergänge und reduzierte Bewegung.

Beim Erreichen des Schlussbilds wird Dalidas „Love in Portofino“ über den offiziellen YouTube-Artist-Kanal eingebettet. Falls der Browser die automatische Tonwiedergabe blockiert, startet der sichtbare Musikknopf sie mit einem Klick.

## Qualität

```bash
npm run check
npm run build
```

Die lokal gespeicherten Fotos stammen aus Wikimedia Commons. Vollständige Angaben stehen in [CREDITS.md](CREDITS.md) und im eingebauten Dialog „Bildnachweise“.
