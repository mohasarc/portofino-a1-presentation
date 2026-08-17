export type MapStage = 'italy' | 'liguria' | 'genoa' | 'portofino'
export type BeatKind = 'hero' | 'map' | 'photo' | 'tourism' | 'landmarks' | 'finale'

export type Beat = {
  id: string
  section: string
  kind: BeatKind
  sentence: string
  media?: string
  mapStage?: MapStage
  align?: 'left' | 'right' | 'center'
  crop?: { scale: number; x: number; y: number }
  accent?: string
}

export const assetPath = (filename: string) => `${import.meta.env.BASE_URL}images/${filename}`

export const deck = {
  title: 'Portofino – Ein kleines Paradies in Italien',
  beats: [
    {
      id: 'paradies',
      section: 'Ankunft',
      kind: 'hero',
      sentence: 'Portofino – Ein kleines Paradies in Italien',
      media: assetPath('portofino-panorama.jpg'),
      align: 'left',
      crop: { scale: 1.1, x: 0, y: 18 },
    },
    {
      id: 'italien',
      section: 'Die Reise',
      kind: 'map',
      sentence: 'Portofino liegt in Italien.',
      mapStage: 'italy',
      align: 'left',
      accent: 'Italien',
    },
    {
      id: 'ligurien',
      section: 'Die Reise',
      kind: 'map',
      sentence: 'Es liegt in der Region Ligurien, an der italienischen Riviera.',
      mapStage: 'liguria',
      align: 'right',
      accent: 'Ligurien',
    },
    {
      id: 'dorf-am-meer',
      section: 'Die Küste',
      kind: 'photo',
      sentence: 'Portofino liegt am Meer und ist ein kleines Dorf.',
      media: assetPath('portofino-panorama.jpg'),
      mapStage: 'portofino',
      align: 'left',
      crop: { scale: 1.34, x: -38, y: 62 },
      accent: 'am Meer',
    },
    {
      id: 'genua',
      section: 'Die Küste',
      kind: 'map',
      sentence: 'Genua ist ungefähr 30 Kilometer entfernt.',
      mapStage: 'genoa',
      align: 'right',
      accent: '30 Kilometer',
    },
    {
      id: 'klein',
      section: 'Das Dorf',
      kind: 'photo',
      sentence: 'Portofino ist sehr klein.',
      media: assetPath('portofino-harbor.jpg'),
      align: 'left',
      crop: { scale: 1.3, x: 100, y: 18 },
      accent: 'sehr klein',
    },
    {
      id: 'menschen',
      section: 'Das Dorf',
      kind: 'photo',
      sentence: 'Dort leben ungefähr 355 Menschen.',
      media: assetPath('portofino-harbor.jpg'),
      align: 'right',
      crop: { scale: 1.16, x: -42, y: 0 },
    },
    {
      id: 'sommer',
      section: 'Sommer',
      kind: 'tourism',
      sentence: 'Im Sommer kommen sehr viele Touristen.',
      media: assetPath('portofino-waterfront.jpg'),
      align: 'center',
      crop: { scale: 1.4, x: -82, y: 42 },
      accent: 'sehr viele',
    },
    {
      id: 'sehenswuerdigkeiten',
      section: 'Entdecken',
      kind: 'landmarks',
      sentence: 'Sehenswürdigkeiten: San Giorgio, Castello Brown, Leuchtturm.',
      align: 'left',
    },
    {
      id: 'pesto',
      section: 'Geschmack',
      kind: 'photo',
      sentence: 'Pesto ist eine Spezialität aus Ligurien.',
      media: assetPath('pesto.jpg'),
      align: 'right',
      crop: { scale: 1.16, x: -90, y: 0 },
      accent: 'Pesto',
    },
    {
      id: 'focaccia',
      section: 'Geschmack',
      kind: 'photo',
      sentence: 'Sehr bekannt ist auch Focaccia.',
      media: assetPath('focaccia.jpg'),
      align: 'left',
      crop: { scale: 1.18, x: 110, y: 0 },
      accent: 'Focaccia',
    },
    {
      id: 'meer',
      section: 'Geschmack',
      kind: 'photo',
      sentence: 'Man kann auch Fisch und Meeresfrüchte essen.',
      media: assetPath('seafood.jpg'),
      align: 'right',
      crop: { scale: 1.18, x: -90, y: 0 },
      accent: 'Meeresfrüchte',
    },
    {
      id: 'wein',
      section: 'Geschmack',
      kind: 'photo',
      sentence: 'Ein lokales Getränk ist Wein aus Ligurien.',
      media: assetPath('wine.jpg'),
      align: 'left',
      crop: { scale: 1.25, x: 90, y: -18 },
      accent: 'Wein',
    },
    {
      id: 'meinung',
      section: 'Meine Meinung',
      kind: 'photo',
      sentence: 'Ich finde Portofino sehr schön.',
      media: assetPath('portofino-harbor.jpg'),
      align: 'center',
      crop: { scale: 1.13, x: 0, y: 8 },
      accent: 'sehr schön',
    },
    {
      id: 'haeuser',
      section: 'Meine Meinung',
      kind: 'photo',
      sentence: 'Es liegt am Meer und hat viele bunte Häuser.',
      media: assetPath('portofino-harbor.jpg'),
      align: 'left',
      crop: { scale: 1.32, x: -120, y: 24 },
      accent: 'bunte Häuser',
    },
    {
      id: 'besuchen',
      section: 'Meine Meinung',
      kind: 'photo',
      sentence: 'Ich möchte Portofino gerne einmal besuchen.',
      media: assetPath('lighthouse.jpg'),
      align: 'right',
      crop: { scale: 1.22, x: -96, y: 0 },
      accent: 'besuchen',
    },
    {
      id: 'danke',
      section: 'Arrivederci',
      kind: 'finale',
      sentence: 'Vielen Dank für eure Aufmerksamkeit!',
      media: assetPath('portofino-panorama.jpg'),
      align: 'center',
      crop: { scale: 1.08, x: 0, y: 28 },
    },
  ] satisfies Beat[],
}

export const imageSources = [
  { label: 'Portofino panorama', author: 'Zinnmann', url: 'https://commons.wikimedia.org/wiki/File:20190502_Portofino_Panorama_zm.jpg' },
  { label: 'Portofino harbor', author: 'Quintin Soloviev', url: 'https://commons.wikimedia.org/wiki/File:Portofino_harbor.jpg' },
  { label: 'Harbour of Portofino', author: 'Superchilum', url: 'https://commons.wikimedia.org/wiki/File:Harbour_of_Portofino.jpg' },
  { label: 'San Giorgio', author: 'Al*from*Lig', url: 'https://commons.wikimedia.org/wiki/File:Chiesa_San_Giorgio_(Portofino).jpg' },
  { label: 'Castello Brown', author: 'Superchilum', url: 'https://commons.wikimedia.org/wiki/File:Castello_Brown_Portofino_07.jpg' },
  { label: 'Portofino lighthouse', author: 'Stefan Schäfer', url: 'https://commons.wikimedia.org/wiki/File:LightPortofino.jpg' },
  { label: 'Pesto alla genovese', author: 'AlfonsoLucifredi', url: 'https://commons.wikimedia.org/wiki/File:Pesto_alla_genovese.jpg' },
  { label: 'Focaccia genovese', author: 'Teatroge', url: 'https://commons.wikimedia.org/wiki/File:Focaccia_genovese_su_tagliere_in_legno,_1.jpg' },
  { label: 'Fritto misto', author: 'Sergio Conti', url: 'https://commons.wikimedia.org/wiki/File:Fritto_misto_di_pesce_con_limone.jpg' },
  { label: 'Cinque Terre wine', author: 'Lee Edwin Coursey', url: 'https://commons.wikimedia.org/wiki/File:Vin_blanc_des_Cinque_Terre.jpg' },
]
