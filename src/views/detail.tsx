import { useMemo, type ReactNode } from 'react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph, Spinner, Separator } from '@hanzo/gui'
import { MONO, ink, asKind } from '../theme'
import { type Entry, type Tag, type EntryTag, reverseChron, stamp } from '../lib/entries'
import { Mono, Eyebrow, GhostButton, VersionChip, KindPill, DraftChip, TagChip, EntryContent } from '../ui'

/**
 * Full entry view: the complete body (blank-line-separated paragraphs) under a
 * mono header, its tags, and a "related" list of entries that share a tag or
 * type — click one to keep reading. Back returns to the feed.
 */
export function Detail({
  id,
  onBack,
  onOpen,
}: {
  id: string
  onBack: () => void
  onOpen: (id: string) => void
}) {
  const entriesQ = useQuery<Entry>('entries', { realtime: false })
  const tagsQ = useQuery<Tag>('tags', { realtime: false })
  const linksQ = useQuery<EntryTag>('entry_tags', { realtime: false })

  const tagsById = useMemo(() => new Map(tagsQ.data.map((t) => [t.id, t])), [tagsQ.data])
  const tagIdsByEntry = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const l of linksQ.data) m.set(l.entry_id, [...(m.get(l.entry_id) ?? []), l.tag_id])
    return m
  }, [linksQ.data])

  const entry = entriesQ.data.find((e) => e.id === id)
  const tagsFor = (eid: string) =>
    (tagIdsByEntry.get(eid) ?? []).map((tid) => tagsById.get(tid)).filter((t): t is Tag => Boolean(t))

  const related = useMemo(() => {
    if (!entry) return []
    const mine = new Set(tagIdsByEntry.get(entry.id) ?? [])
    const others = entriesQ.data.filter((e) => e.id !== entry.id && !e.draft)
    const shareTag = others.filter((e) => (tagIdsByEntry.get(e.id) ?? []).some((t) => mine.has(t)))
    const sameKind = others.filter(
      (e) => asKind(e.kind) === asKind(entry.kind) && !shareTag.includes(e),
    )
    return [...shareTag.sort(reverseChron), ...sameKind.sort(reverseChron)].slice(0, 4)
  }, [entry, entriesQ.data, tagIdsByEntry])

  if (entriesQ.isLoading) {
    return (
      <XStack gap="$2" alignItems="center" opacity={0.6} paddingVertical="$6">
        <Spinner /> <Mono color={ink.dim}>loading…</Mono>
      </XStack>
    )
  }

  if (!entry) {
    return (
      <YStack gap="$4" alignItems="flex-start">
        <Mono color={ink.faint}>// entry not found</Mono>
        <GhostButton size="$3" onPress={onBack}>
          ← back to changelog
        </GhostButton>
      </YStack>
    )
  }

  const paras = entry.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const myTags = tagsFor(entry.id)

  return (
    <YStack gap="$5" maxWidth={720}>
      <XStack alignItems="center" gap="$3">
        <GhostButton size="$2" onPress={onBack}>
          ← changelog
        </GhostButton>
      </XStack>

      <YStack gap="$4">
        <XStack alignItems="center" gap="$2" flexWrap="wrap">
          <VersionChip version={entry.version} highlight={!entry.draft} />
          <KindPill kind={asKind(entry.kind)} />
          {entry.draft ? <DraftChip /> : null}
          <Mono fontSize={12} letterSpacing={1} color={ink.faint}>
            {stamp(entry.published_at || entry.created)}
          </Mono>
        </XStack>

        <Text fontFamily={MONO} fontSize={32} lineHeight={38} fontWeight="700" letterSpacing={-0.5} color={ink.text}>
          {entry.title}
        </Text>

        <YStack gap="$3">
          {paras.length ? (
            paras.map((p, i) => (
              <Paragraph key={i} fontSize={16} lineHeight={26} color={ink.text}>
                {p}
              </Paragraph>
            ))
          ) : (
            <Paragraph fontSize={16} lineHeight={26} color={ink.dim}>
              (no body)
            </Paragraph>
          )}
        </YStack>

        {myTags.length ? (
          <XStack gap="$2" flexWrap="wrap">
            {myTags.map((t) => (
              <TagChip key={t.id} label={t.label} color={t.color} />
            ))}
          </XStack>
        ) : null}
      </YStack>

      {related.length ? (
        <YStack gap="$3" marginTop="$4">
          <Separator borderColor={ink.lineSoft} />
          <Eyebrow>related</Eyebrow>
          <YStack>
            {related.map((e) => (
              <TimelineRowless key={e.id} onPress={() => onOpen(e.id)}>
                <EntryContent
                  version={e.version}
                  kind={asKind(e.kind)}
                  when={stamp(e.published_at || e.created)}
                  title={e.title}
                  body={e.body}
                  compact
                />
              </TimelineRowless>
            ))}
          </YStack>
        </YStack>
      ) : null}
    </YStack>
  )
}

/** A compact clickable card (no connector rail) for the related list. */
function TimelineRowless({ onPress, children }: { onPress: () => void; children: ReactNode }) {
  return (
    <YStack
      onPress={onPress}
      cursor="pointer"
      paddingVertical="$3"
      paddingHorizontal="$3"
      borderRadius={10}
      hoverStyle={{ backgroundColor: ink.panelHi }}
    >
      {children}
    </YStack>
  )
}
