import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, Text, Paragraph } from '@hanzo/gui'
import { MONO, ink } from '../theme'
import { SAMPLE } from '../lib/entries'
import { Mono, Eyebrow, PrimaryButton, TimelineRow, EntryContent } from '../ui'

/** The wordmark used across the app: a lime chevron + mono name. */
export function Wordmark() {
  return (
    <XStack alignItems="center" gap="$2">
      <Text fontFamily={MONO} fontSize={16} fontWeight="700" color={ink.lime}>
        ◢
      </Text>
      <Text fontFamily={MONO} fontSize={16} fontWeight="700" letterSpacing={0.5} color={ink.text}>
        shipwright
      </Text>
    </XStack>
  )
}

/**
 * The signed-out landing — Shipwright's public face. It IS a changelog page:
 * a dense intro over a preview timeline (the connector line, version chips,
 * type pills, lime-highlighted newest release) so a visitor sees the format
 * before signing in. The preview rows are illustrative, clearly labelled.
 * The one action is PKCE sign-in with Hanzo (hanzo.id) — IAM owns credentials.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={ink.bg}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$5"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderColor={ink.lineSoft}
      >
        <XStack alignItems="center" gap="$3">
          <Wordmark />
          <YStack paddingHorizontal={7} paddingVertical={2} borderRadius={4} backgroundColor={ink.panel}>
            <Mono fontSize={10} letterSpacing={2} textTransform="uppercase" color={ink.faint}>
              changelog
            </Mono>
          </YStack>
        </XStack>
        <PrimaryButton size="$3" disabled={isLoading} onPress={() => login()}>
          {isLoading ? 'Loading…' : 'Sign in'}
        </PrimaryButton>
      </XStack>

      <YStack
        flex={1}
        width="100%"
        maxWidth={860}
        alignSelf="center"
        paddingHorizontal="$5"
        paddingVertical="$7"
        gap="$7"
      >
        <YStack gap="$4" maxWidth={620}>
          <Eyebrow color={ink.lime}>// public changelog + blog</Eyebrow>
          <Text
            fontFamily={MONO}
            fontSize={44}
            lineHeight={49}
            fontWeight="700"
            letterSpacing={-1}
            color={ink.text}
          >
            Ship it, then tell everyone.
          </Text>
          <Paragraph fontSize={16} lineHeight={25} color={ink.dim}>
            A public release timeline paired with a longer-form blog. Post dated
            entries tagged feature, fix, or breaking — visitors read the feed
            reverse-chronologically and filter by type or tag. Built on
            @hanzo/gui, signed in with Hanzo IAM, stored per-org in Hanzo Base.
          </Paragraph>
          <XStack gap="$2" flexWrap="wrap" marginTop={2}>
            {['@hanzo/gui', 'IAM · PKCE', 'Base · org-scoped'].map((s) => (
              <YStack
                key={s}
                paddingHorizontal={9}
                paddingVertical={4}
                borderRadius={5}
                borderWidth={1}
                borderColor={ink.line}
                backgroundColor={ink.panel}
              >
                <Mono fontSize={12} color={ink.dim}>
                  {s}
                </Mono>
              </YStack>
            ))}
          </XStack>
          <XStack alignItems="center" gap="$3" marginTop="$2">
            <PrimaryButton size="$4" disabled={isLoading} onPress={() => login()}>
              {isLoading ? 'Loading…' : 'Sign in with Hanzo'}
            </PrimaryButton>
            <Mono fontSize={13} color={ink.faint}>
              → compose &amp; publish
            </Mono>
          </XStack>
        </YStack>

        <YStack gap="$2">
          <XStack alignItems="center" gap="$3">
            <Eyebrow>latest releases</Eyebrow>
            <YStack flex={1} height={1} backgroundColor={ink.lineSoft} />
            <Mono fontSize={11} color={ink.faint}>
              // preview
            </Mono>
          </XStack>

          <YStack>
            {SAMPLE.map((s, i) => (
              <TimelineRow key={s.version} highlight={i === 0}>
                <EntryContent
                  version={s.version}
                  kind={s.kind}
                  when={s.when}
                  title={s.title}
                  body={s.body}
                  tags={s.tags.map((label) => ({ label }))}
                  highlight={i === 0}
                />
              </TimelineRow>
            ))}
          </YStack>

          <Mono fontSize={12} color={ink.faint} marginTop="$2">
            // preview data — sign in to publish your own
          </Mono>
        </YStack>
      </YStack>
    </YStack>
  )
}
