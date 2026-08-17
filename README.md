# Portofino — eine filmische Deutsch-A1-Reise

Eine fotografische Web-Präsentation, die sich wie eine durchgehende Kamerafahrt anfühlt: eine geografisch präzise MapLibre-Reise von der Welt → Europa → Italien → Ligurien → Portofino, danach Küste, Dorf, Menschen, Sehenswürdigkeiten, Essen und persönliche Meinung.

Die Seite wird bei jedem Push auf `main` automatisch über GitHub Pages veröffentlicht.

[Präsentation öffnen](https://mohasarc.github.io/portofino-a1-presentation/)

[PDF-Backup herunterladen](exports/Portofino-A1-Backup.pdf)

## Start

```bash
npm install
npm run dev
```

Beim Öffnen lädt die Startansicht zuerst alle Fotos, Kartenstufen, Schriften und die Schlussmusik vollständig vor. Erst wenn „Alles ist bereit“ erscheint, wird die Präsentation freigegeben. Der Startknopf aktiviert zugleich die Audiowiedergabe für die spätere Schlussfolie.

Steuerung: Pfeiltasten, Leertaste, Mausrad, Wischgeste oder die Pfeile unten rechts. `R` startet die Reise neu. Mit `?beat=9` kann direkt zu einer Station gesprungen werden.

## Präsentationsprinzip

Alle 17 vorgegebenen Sätze stehen einzeln in `src/deck.ts`. Verwandte Stationen teilen dieselbe Bildwelt, sodass beim Weitergehen keine klassischen Folienwechsel entstehen. Framer Motion steuert Karten-Zooms, Bild-Parallax, Ken-Burns-Bewegung, Übergänge und reduzierte Bewegung.

Beim Erreichen des Schlussbilds spielt eine vollständig vorgeladene, offizielle 30-Sekunden-Vorschau von Dalidas „Love in Portofino“ direkt im Browser—ohne YouTube, Video oder Werbung. Falls der Browser die automatische Tonwiedergabe blockiert, startet der sichtbare Musikknopf sie mit einem Klick. Eine lizenzierte eigene Audiodatei kann beim Build über `VITE_MUSIC_URL` als Quelle gesetzt werden.

## Qualität

```bash
npm run check
npm run build
npm run export:pdf
```

Die lokal gespeicherten Fotos stammen aus Wikimedia Commons. Vollständige Angaben stehen in [CREDITS.md](CREDITS.md) und im eingebauten Dialog „Bildnachweise“.
