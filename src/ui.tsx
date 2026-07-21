import type { ComponentProps, ReactNode } from 'react'
import { Text, Paragraph, XStack, YStack, Button, Input, TextArea } from '@hanzo/gui'
import { MONO, ink, KINDS, type Kind } from './theme'

/** Text in the JetBrains-style mono stack; every prop stays overridable. */
export function Mono(props: ComponentProps<typeof Text>) {
  return <Text fontFamily={MONO} color={ink.text} {...props} />
}

/** A section/eyebrow label: tiny, tracked-out, uppercase mono. */
export function Eyebrow(props: ComponentProps<typeof Text>) {
  return (
    <Mono
      fontSize={11}
      letterSpacing={2}
      textTransform="uppercase"
      color={ink.faint}
      {...props}
    />
  )
}

/** The `v2.4.0` chip. `highlight` fills it lime for the newest release. */
export function VersionChip({ version, highlight }: { version: string; highlight?: boolean }) {
  if (!version) return null
  return (
    <YStack
      paddingHorizontal={8}
      paddingVertical={3}
      borderRadius={5}
      borderWidth={1}
      alignSelf="flex-start"
      backgroundColor={highlight ? ink.lime : 'transparent'}
      borderColor={highlight ? ink.lime : ink.line}
    >
      <Mono fontSize={12} fontWeight="700" letterSpacing={0.5} color={highlight ? ink.limeInk : ink.dim}>
        {version}
      </Mono>
    </YStack>
  )
}

/** The type pill — glyph + kind, in the kind's own translucent color. */
export function KindPill({ kind }: { kind: Kind }) {
  const m = KINDS[kind]
  return (
    <XStack
      alignItems="center"
      gap={5}
      paddingHorizontal={8}
      paddingVertical={3}
      borderRadius={5}
      backgroundColor={m.bg}
    >
      <Mono fontSize={11} fontWeight="700" color={m.fg}>
        {m.glyph}
      </Mono>
      <Mono fontSize={11} fontWeight="600" letterSpacing={1} textTransform="uppercase" color={m.fg}>
        {m.label}
      </Mono>
    </XStack>
  )
}

/** A `#label` tag chip; clickable when `onPress` is set, filled when `active`. */
export function TagChip({
  label,
  color,
  active,
  onPress,
}: {
  label: string
  color?: string
  active?: boolean
  onPress?: () => void
}) {
  const c = color || ink.dim
  return (
    <XStack
      onPress={onPress}
      cursor={onPress ? 'pointer' : undefined}
      alignItems="center"
      paddingHorizontal={7}
      paddingVertical={2}
      borderRadius={999}
      borderWidth={1}
      borderColor={active ? c : ink.line}
      backgroundColor={active ? c : 'transparent'}
      hoverStyle={onPress ? { borderColor: c } : undefined}
    >
      <Mono fontSize={11} color={active ? ink.bg : ink.dim}>
        #{label}
      </Mono>
    </XStack>
  )
}

/**
 * One row on the changelog timeline: a left gutter carrying the continuous
 * connector line + a node dot (lime & solid for the newest release, a hollow
 * graphite ring otherwise), and the entry content on the right.
 */
export function TimelineRow({
  highlight,
  onPress,
  children,
}: {
  highlight?: boolean
  onPress?: () => void
  children: ReactNode
}) {
  return (
    <XStack
      onPress={onPress}
      cursor={onPress ? 'pointer' : undefined}
      hoverStyle={onPress ? { backgroundColor: ink.panelHi } : undefined}
      borderRadius={10}
      paddingRight="$3"
    >
      <YStack width={38} position="relative" alignItems="center">
        <YStack position="absolute" top={0} bottom={0} width={2} borderRadius={1} backgroundColor={ink.line} />
        <YStack
          marginTop={22}
          width={13}
          height={13}
          borderRadius={999}
          zIndex={1}
          borderWidth={2}
          backgroundColor={highlight ? ink.lime : ink.panel}
          borderColor={highlight ? ink.lime : ink.line}
        />
      </YStack>
      <YStack flex={1} paddingVertical="$4" gap="$2">
        {children}
      </YStack>
    </XStack>
  )
}

/** A DRAFT marker chip for unpublished entries. */
export function DraftChip() {
  return (
    <YStack paddingHorizontal={8} paddingVertical={3} borderRadius={5} borderWidth={1} borderColor={ink.line}>
      <Mono fontSize={11} fontWeight="600" letterSpacing={1} textTransform="uppercase" color={ink.faint}>
        draft
      </Mono>
    </YStack>
  )
}

/**
 * The presentational entry block shared by the changelog feed, the landing
 * preview, and the "related" list: a mono header (version · type · datestamp),
 * a title, the body, and any tag chips. Pure props — no data access.
 */
export function EntryContent({
  version,
  kind,
  when,
  title,
  body,
  tags,
  highlight,
  draft,
  compact,
}: {
  version: string
  kind: Kind
  when: string
  title: string
  body: string
  tags?: { label: string; color?: string }[]
  highlight?: boolean
  draft?: boolean
  compact?: boolean
}) {
  return (
    <YStack gap="$2" opacity={draft ? 0.72 : 1}>
      <XStack alignItems="center" gap="$2" flexWrap="wrap">
        <VersionChip version={version} highlight={highlight} />
        <KindPill kind={kind} />
        {draft ? <DraftChip /> : null}
        <Mono fontSize={11} letterSpacing={1} color={ink.faint}>
          {when}
        </Mono>
      </XStack>
      <Text fontSize={compact ? 15 : 18} fontWeight="600" color={ink.text} lineHeight={compact ? 21 : 25}>
        {title}
      </Text>
      {compact ? null : (
        <Paragraph fontSize={14} lineHeight={22} color={ink.dim}>
          {body}
        </Paragraph>
      )}
      {tags && tags.length ? (
        <XStack gap="$2" flexWrap="wrap" marginTop={2}>
          {tags.map((t) => (
            <TagChip key={t.label} label={t.label} color={t.color} />
          ))}
        </XStack>
      ) : null}
    </YStack>
  )
}

/**
 * Primary action — the one lime button; used sparingly. The label is wrapped in
 * <Mono> because @hanzo/gui's Button carries no `fontFamily` prop (it is a
 * Stack, not a text node) — the mono family lives on the child text instead.
 */
export function PrimaryButton({ children, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      backgroundColor={ink.lime}
      borderWidth={0}
      hoverStyle={{ backgroundColor: '#c7ff5e' }}
      pressStyle={{ opacity: 0.9 }}
      {...props}
    >
      <Mono fontSize={14} fontWeight="700" color={ink.limeInk}>
        {children}
      </Mono>
    </Button>
  )
}

/** Secondary action — a bordered graphite ghost button. */
export function GhostButton({ children, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      backgroundColor="transparent"
      borderWidth={1}
      borderColor={ink.line}
      hoverStyle={{ backgroundColor: ink.panelHi, borderColor: ink.dim }}
      pressStyle={{ opacity: 0.9 }}
      {...props}
    >
      <Mono fontSize={13} fontWeight="600" color={ink.text}>
        {children}
      </Mono>
    </Button>
  )
}

/** A single-line input in the terminal palette. */
export function TermInput(props: ComponentProps<typeof Input>) {
  return (
    <Input
      backgroundColor={ink.panel}
      borderWidth={1}
      borderColor={ink.line}
      color={ink.text}
      focusStyle={{ borderColor: ink.dim }}
      {...props}
    />
  )
}

/** A multi-line body input in the terminal palette (mono for a code feel). */
export function TermArea(props: ComponentProps<typeof TextArea>) {
  return (
    <TextArea
      backgroundColor={ink.panel}
      borderWidth={1}
      borderColor={ink.line}
      color={ink.text}
      focusStyle={{ borderColor: ink.dim }}
      {...props}
    />
  )
}

/** A labelled form field: mono eyebrow + optional hint above the control. */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <YStack gap="$2">
      <XStack alignItems="baseline" gap="$2">
        <Eyebrow>{label}</Eyebrow>
        {hint ? (
          <Mono fontSize={11} color={ink.faint}>
            {hint}
          </Mono>
        ) : null}
      </XStack>
      {children}
    </YStack>
  )
}
