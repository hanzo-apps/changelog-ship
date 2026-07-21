import { useMemo, useState } from 'react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph, Spinner } from '@hanzo/gui'
import { MONO, ink, KINDS, KIND_ORDER, asKind, type Kind } from '../theme'
import { type Entry, type Tag, type EntryTag, reverseChron, stamp } from '../lib/entries'
import { Mono, Eyebrow, PrimaryButton, TimelineRow, EntryContent, TagChip } from '../ui'

type Filter = { by: 'all' } | { by: 'kind'; kind: Kind } | { by: 'tag'; tagId: string }

/** A clickable type-filter pill in the kind's own color. */
function KindFilter({ kind, active, onPress }: { kind: Kind; active: boolean; onPress: () => void }) {
  const m = KINDS[kind]
  return (
    <XStack
      onPress={onPress}
      cursor="pointer"
      alignItems="center"
      gap={5}
      paddingHorizontal={9}
      paddingVertical={4}
      borderRadius={6}
      borderWidth={1}
      backgroundColor={active ? m.bg : 'transparent'}
      borderColor={active ? m.fg : ink.line}
      hoverStyle={{ borderColor: m.fg }}
    >
      <Mono fontSize={11} fontWeight="700" color={m.fg}>
        {m.glyph}
      </Mono>
      <Mono fontSize={11} fontWeight="600" letterSpacing={1} textTransform="uppercase" color={active ? m.fg : ink.dim}>
        {m.label}
      </Mono>
    </XStack>
  )
}

/**
 * The changelog feed: a reverse-chronological timeline of the org's entries,
 * with the newest published release lime-highlighted. A filter bar narrows by
 * type (feature/fix/breaking/post) or by tag. All three collections
 * (entries, tags, entry_tags) are read here and joined in the browser.
 */
export function Feed({ onOpen, onCompose }: { onOpen: (id: string) => void; onCompose: () => void }) {
  const entriesQ = useQuery<Entry>('entries', { sort: '-published_at', realtime: false })
  const tagsQ = useQuery<Tag>('tags', { realtime: false })
  const linksQ = useQuery<EntryTag>('entry_tags', { realtime: false })
  const [filter, setFilter] = useState<Filter>({ by: 'all' })

  const entries = useMemo(() => [...entriesQ.data].sort(reverseChron), [entriesQ.data])
  const tagsById = useMemo(() => new Map(tagsQ.data.map((t) => [t.id, t])), [tagsQ.data])
  const tagIdsByEntry = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const l of linksQ.data) m.set(l.entry_id, [...(m.get(l.entry_id) ?? []), l.tag_id])
    return m
  }, [linksQ.data])

  const newestId = useMemo(() => entries.find((e) => !e.draft)?.id, [entries])
  const tagsFor = (id: string) =>
    (tagIdsByEntry.get(id) ?? []).map((tid) => tagsById.get(tid)).filter((t): t is Tag => Boolean(t))

  const shown = entries.filter((e) => {
    if (filter.by === 'kind') return asKind(e.kind) === filter.kind
    if (filter.by === 'tag') return (tagIdsByEntry.get(e.id) ?? []).includes(filter.tagId)
    return true
  })

  const isActive = (f: Filter) =>
    f.by === filter.by &&
    (f.by !== 'kind' || (filter.by === 'kind' && f.kind === filter.kind)) &&
    (f.by !== 'tag' || (filter.by === 'tag' && f.tagId === filter.tagId))

  return (
    <YStack gap="$5">
      <XStack alignItems="baseline" gap="$3" flexWrap="wrap">
        <Text fontFamily={MONO} fontSize={24} fontWeight="700" letterSpacing={-0.5} color={ink.text}>
          Releases
        </Text>
        <Mono fontSize={12} color={ink.faint}>
          {entries.length === 1 ? '1 entry' : `${entries.length} entries`}
        </Mono>
      </XStack>

      {/* Filter bar: All · type pills · tag chips */}
      <XStack gap="$2" flexWrap="wrap" alignItems="center">
        <XStack
          onPress={() => setFilter({ by: 'all' })}
          cursor="pointer"
          paddingHorizontal={10}
          paddingVertical={4}
          borderRadius={6}
          borderWidth={1}
          backgroundColor={filter.by === 'all' ? ink.text : 'transparent'}
          borderColor={filter.by === 'all' ? ink.text : ink.line}
          hoverStyle={{ borderColor: ink.dim }}
        >
          <Mono fontSize={11} fontWeight="700" letterSpacing={1} textTransform="uppercase" color={filter.by === 'all' ? ink.bg : ink.dim}>
            all
          </Mono>
        </XStack>
        {KIND_ORDER.map((k) => (
          <KindFilter
            key={k}
            kind={k}
            active={isActive({ by: 'kind', kind: k })}
            onPress={() => setFilter(isActive({ by: 'kind', kind: k }) ? { by: 'all' } : { by: 'kind', kind: k })}
          />
        ))}
        {tagsQ.data.length ? <YStack width={1} height={20} backgroundColor={ink.line} marginHorizontal={2} /> : null}
        {tagsQ.data.map((t) => (
          <TagChip
            key={t.id}
            label={t.label}
            color={t.color}
            active={isActive({ by: 'tag', tagId: t.id })}
            onPress={() => setFilter(isActive({ by: 'tag', tagId: t.id }) ? { by: 'all' } : { by: 'tag', tagId: t.id })}
          />
        ))}
      </XStack>

      {entriesQ.isLoading ? (
        <XStack gap="$2" alignItems="center" opacity={0.6} paddingVertical="$6">
          <Spinner /> <Mono color={ink.dim}>loading releases…</Mono>
        </XStack>
      ) : entriesQ.error ? (
        <YStack
          gap="$2"
          padding="$4"
          borderWidth={1}
          borderColor={ink.line}
          borderRadius={10}
          backgroundColor={ink.panel}
        >
          <Mono color={KINDS.breaking.fg}>could not reach Base</Mono>
          <Paragraph fontSize={13} color={ink.dim}>
            {entriesQ.error.message}. Confirm VITE_HANZO_BASE_URL and that you are signed in.
          </Paragraph>
        </YStack>
      ) : entries.length === 0 ? (
        <YStack
          gap="$3"
          padding="$6"
          borderWidth={1}
          borderColor={ink.line}
          borderRadius={12}
          backgroundColor={ink.panel}
          alignItems="flex-start"
        >
          <Eyebrow>empty changelog</Eyebrow>
          <Text fontFamily={MONO} fontSize={18} color={ink.text}>
            No releases yet.
          </Text>
          <Paragraph fontSize={14} color={ink.dim}>
            Write the first entry — a shipped feature, a fix, or a post — and it lands here, newest first.
          </Paragraph>
          <PrimaryButton size="$3" onPress={onCompose}>
            + Write the first entry
          </PrimaryButton>
        </YStack>
      ) : shown.length === 0 ? (
        <Mono color={ink.faint} paddingVertical="$5">
          // nothing matches this filter
        </Mono>
      ) : (
        <YStack>
          {shown.map((e) => (
            <TimelineRow key={e.id} highlight={e.id === newestId} onPress={() => onOpen(e.id)}>
              <EntryContent
                version={e.version}
                kind={asKind(e.kind)}
                when={stamp(e.published_at || e.created)}
                title={e.title}
                body={e.body}
                tags={tagsFor(e.id).map((t) => ({ label: t.label, color: t.color }))}
                highlight={e.id === newestId}
                draft={Boolean(e.draft)}
              />
            </TimelineRow>
          ))}
        </YStack>
      )}
    </YStack>
  )
}
