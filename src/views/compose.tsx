import { useState } from 'react'
import { useBase } from '@hanzo/base/react'
import type { BaseClient } from '@hanzo/base/react'
import { YStack, XStack, Text } from '@hanzo/gui'
import { MONO, ink, KINDS, KIND_ORDER, tagColor, type Kind } from '../theme'
import type { Entry, Tag } from '../lib/entries'
import { Mono, Eyebrow, PrimaryButton, GhostButton, Field, TermInput, TermArea } from '../ui'

/** Find a tag by exact label or create it with a stable color. */
async function findOrCreateTag(client: BaseClient, label: string): Promise<Tag> {
  const tags = client.collection('tags')
  try {
    return await tags.getFirstListItem<Tag>(`label="${label}"`)
  } catch {
    return await tags.create<Tag>({ label, color: tagColor(label) })
  }
}

/**
 * The signed-in editor: compose a changelog entry or a longer post, choose its
 * type, stamp a version, attach comma-separated tags, then publish or save as
 * a draft. Publishing writes the `entries` row (published_at = now) and, for
 * each tag, a find-or-create in `tags` plus an `entry_tags` join — the whole
 * schema, exercised. Drafts are stored with `draft = true` and no stamp.
 */
export function Compose({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const client = useBase()
  const [title, setTitle] = useState('')
  const [version, setVersion] = useState('')
  const [kind, setKind] = useState<Kind>('feature')
  const [tagText, setTagText] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(publish: boolean) {
    if (!title.trim() || !body.trim()) {
      setError('A title and body are required.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const entry = await client.collection('entries').create<Entry>({
        title: title.trim(),
        body: body.trim(),
        kind,
        version: version.trim(),
        published_at: publish ? new Date().toISOString() : '',
        draft: !publish,
      })
      const labels = Array.from(
        new Set(
          tagText
            .split(',')
            .map((t) => t.trim().replace(/^#/, '').toLowerCase())
            .filter(Boolean),
        ),
      )
      for (const label of labels) {
        const tag = await findOrCreateTag(client, label)
        await client.collection('entry_tags').create({ entry_id: entry.id, tag_id: tag.id })
      }
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the entry.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <YStack gap="$5" maxWidth={720}>
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontFamily={MONO} fontSize={24} fontWeight="700" letterSpacing={-0.5} color={ink.text}>
          New entry
        </Text>
        <GhostButton size="$2" disabled={busy} onPress={onCancel}>
          esc
        </GhostButton>
      </XStack>

      <Field label="title">
        <TermInput value={title} placeholder="Incremental builds & a shared remote cache" onChangeText={setTitle} />
      </Field>

      <XStack gap="$4" flexWrap="wrap">
        <YStack gap="$2" width={200}>
          <Eyebrow>version</Eyebrow>
          <TermInput fontFamily={MONO} value={version} placeholder="v2.4.0" onChangeText={setVersion} />
        </YStack>
        <YStack gap="$2" flex={1} minWidth={260}>
          <Eyebrow>type</Eyebrow>
          <XStack gap="$2" flexWrap="wrap">
            {KIND_ORDER.map((k) => {
              const m = KINDS[k]
              const on = kind === k
              return (
                <XStack
                  key={k}
                  onPress={() => setKind(k)}
                  cursor="pointer"
                  alignItems="center"
                  gap={5}
                  paddingHorizontal={10}
                  paddingVertical={7}
                  borderRadius={6}
                  borderWidth={1}
                  backgroundColor={on ? m.bg : 'transparent'}
                  borderColor={on ? m.fg : ink.line}
                  hoverStyle={{ borderColor: m.fg }}
                >
                  <Mono fontSize={11} fontWeight="700" color={m.fg}>
                    {m.glyph}
                  </Mono>
                  <Mono fontSize={11} fontWeight="600" letterSpacing={1} textTransform="uppercase" color={on ? m.fg : ink.dim}>
                    {m.label}
                  </Mono>
                </XStack>
              )
            })}
          </XStack>
        </YStack>
      </XStack>

      <Field label="tags" hint="// comma-separated, e.g. build, perf">
        <TermInput fontFamily={MONO} value={tagText} placeholder="build, perf" onChangeText={setTagText} />
      </Field>

      <Field label="body" hint="// blank line = new paragraph">
        <TermArea
          value={body}
          placeholder={'What shipped, and why it matters.\n\nA second paragraph adds detail for the blog view.'}
          onChangeText={setBody}
          minHeight={220}
          numberOfLines={10}
          fontFamily={MONO}
          fontSize={14}
          verticalAlign="top"
        />
      </Field>

      {error ? (
        <Mono fontSize={13} color={KINDS.breaking.fg}>
          {error}
        </Mono>
      ) : null}

      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <PrimaryButton disabled={busy} onPress={() => submit(true)}>
          {busy ? 'Saving…' : 'Publish'}
        </PrimaryButton>
        <GhostButton disabled={busy} onPress={() => submit(false)}>
          Save as draft
        </GhostButton>
        <Mono fontSize={12} color={ink.faint}>
          → lands newest-first on the changelog
        </Mono>
      </XStack>
    </YStack>
  )
}
