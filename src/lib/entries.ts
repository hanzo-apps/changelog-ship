import type { BaseRecord } from '@hanzo/base/react'
import type { Kind } from '../theme'

/**
 * The rows Shipwright reads/writes, one interface per collection in
 * `schema.sql`. Base stamps id/created/updated/owner/org; these describe the
 * app-owned columns only.
 */

/** A dated release note or a longer-form post (`kind: 'post'`). */
export interface Entry extends BaseRecord {
  title: string
  body: string
  kind: string // Kind — stored as text; narrow with asKind()
  version: string
  published_at: string
  draft: boolean
}

/** A reusable label with a chip color. */
export interface Tag extends BaseRecord {
  label: string
  color: string
}

/** The many-to-many join between entries and tags. */
export interface EntryTag extends BaseRecord {
  entry_id: string
  tag_id: string
}

/** Publish stamp → `MAR 04 2026`, always uppercase mono-friendly. */
export function stamp(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const mon = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  return `${mon} ${String(d.getDate()).padStart(2, '0')} ${d.getFullYear()}`
}

/** Sort newest-first by published_at, falling back to Base's created stamp. */
export function reverseChron(a: Entry, b: Entry): number {
  const ax = a.published_at || a.created || ''
  const bx = b.published_at || b.created || ''
  return ax < bx ? 1 : ax > bx ? -1 : 0
}

/** A read-only entry shape for the signed-out preview timeline. */
export interface Sample {
  version: string
  kind: Kind
  title: string
  body: string
  when: string
  tags: string[]
}

/**
 * Illustrative releases shown on the public landing — a preview of the format,
 * not a real product's history. Sign in to publish your own.
 */
export const SAMPLE: Sample[] = [
  {
    version: 'v2.4.0',
    kind: 'feature',
    title: 'Incremental builds & a shared remote cache',
    body: 'Rebuilds now reuse artifacts across machines. Cold CI drops to a warm-cache path automatically — no config.',
    when: 'MAR 04 2026',
    tags: ['build', 'perf'],
  },
  {
    version: 'v2.3.2',
    kind: 'fix',
    title: 'Reconnect no longer drops the first event',
    body: 'A race in the websocket resume path could swallow the event delivered during reconnect. Buffered and replayed now.',
    when: 'FEB 19 2026',
    tags: ['realtime'],
  },
  {
    version: 'v2.3.0',
    kind: 'feature',
    title: 'Dark dashboard, honest empty states',
    body: 'The whole console reads in a graphite dark theme, and every empty view tells you the one next action.',
    when: 'FEB 02 2026',
    tags: ['ui'],
  },
  {
    version: 'v2.2.0',
    kind: 'breaking',
    title: 'Require Node 20; drop Node 16',
    body: 'Node 16 is end-of-life. The CLI now targets Node 20 LTS. Pin your runners before upgrading.',
    when: 'JAN 15 2026',
    tags: ['runtime'],
  },
]
