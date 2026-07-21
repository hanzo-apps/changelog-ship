/**
 * Shipwright's visual language, in ONE place. A muted-graphite terminal
 * palette with a single lime highlight reserved for the newest release, plus
 * a JetBrains-style monospace stack used for every chip, label, and datestamp.
 *
 * These are raw CSS values passed to @hanzo/gui primitives (Tamagui accepts a
 * plain string on color/backgroundColor/borderColor and, crucially, on
 * `fontFamily` — a non-`$` value renders verbatim, so no token registration is
 * needed). UI stays 100% @hanzo/gui; this file only names the constants.
 */

/** JetBrains-style monospace stack for chips, versions, labels, datestamps. */
export const MONO =
  '"JetBrains Mono", "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", ui-monospace, monospace'

/** The graphite surface ramp + the one lime accent. */
export const ink = {
  bg: '#0d0f13', // page — deep graphite
  panel: '#14171d', // cards / rows
  panelHi: '#191d25', // hover / raised
  line: '#262b35', // borders + the timeline connector
  lineSoft: '#1d222b', // faint dividers
  text: '#d7dce5', // primary
  dim: '#8b93a3', // secondary
  faint: '#5b6270', // tertiary / captions
  lime: '#b6f24a', // the single highlight (newest release)
  limeInk: '#0d0f13', // text on a lime fill
  limeGlow: 'rgba(182,242,74,0.10)', // lime-tinted wash
} as const

/** The four entry kinds and how each pill renders (fg text + translucent bg). */
export type Kind = 'feature' | 'fix' | 'breaking' | 'post'

export interface KindMeta {
  label: string
  glyph: string
  fg: string
  bg: string
  dot: string
}

export const KINDS: Record<Kind, KindMeta> = {
  feature: { label: 'feature', glyph: '+', fg: '#7ee2a8', bg: 'rgba(126,226,168,0.12)', dot: '#7ee2a8' },
  fix: { label: 'fix', glyph: '~', fg: '#6fb8ff', bg: 'rgba(111,184,255,0.12)', dot: '#6fb8ff' },
  breaking: { label: 'breaking', glyph: '!', fg: '#ff8f6b', bg: 'rgba(255,143,107,0.13)', dot: '#ff8f6b' },
  post: { label: 'post', glyph: '§', fg: '#c39bff', bg: 'rgba(195,155,255,0.13)', dot: '#c39bff' },
}

export const KIND_ORDER: Kind[] = ['feature', 'fix', 'breaking', 'post']

/** Narrow an arbitrary stored value to a Kind, defaulting to `feature`. */
export function asKind(v: unknown): Kind {
  return v === 'fix' || v === 'breaking' || v === 'post' ? v : 'feature'
}

/** The muted palette new tags are colored from (deterministic by label). */
export const TAG_COLORS = ['#7ee2a8', '#6fb8ff', '#ff8f6b', '#c39bff', '#e6c15a', '#5fd0c4'] as const

/** Stable color for a tag label so a `#perf` chip looks the same everywhere. */
export function tagColor(label: string): string {
  let h = 0
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0
  return TAG_COLORS[h % TAG_COLORS.length]
}
