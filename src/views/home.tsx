import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, Text } from '@hanzo/gui'
import { MONO, ink } from '../theme'
import { Mono, PrimaryButton, GhostButton } from '../ui'
import { Wordmark } from './signed-out'
import { Feed } from './feed'
import { Detail } from './detail'
import { Compose } from './compose'

/** Where in the app we are — a router-less state machine (one static SPA). */
type Nav = { name: 'feed' } | { name: 'detail'; id: string } | { name: 'compose' }

/**
 * The signed-in shell: a persistent terminal top bar over the active view.
 * Feed → Detail → Compose are switched by local state (no router dependency),
 * so the whole app stays one static SPA that a Base-token query drives.
 */
export function Home() {
  const { user, logout } = useIam()
  const [nav, setNav] = useState<Nav>({ name: 'feed' })
  const who = user?.displayName || user?.name || user?.email || 'you'

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={ink.bg}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$5"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderColor={ink.lineSoft}
        gap="$3"
        flexWrap="wrap"
      >
        <XStack
          alignItems="center"
          gap="$3"
          cursor="pointer"
          onPress={() => setNav({ name: 'feed' })}
          hoverStyle={{ opacity: 0.85 }}
        >
          <Wordmark />
          <YStack paddingHorizontal={7} paddingVertical={2} borderRadius={4} backgroundColor={ink.panel}>
            <Mono fontSize={10} letterSpacing={2} textTransform="uppercase" color={ink.faint}>
              changelog
            </Mono>
          </YStack>
        </XStack>

        <XStack alignItems="center" gap="$3">
          <Mono fontSize={12} color={ink.faint}>
            {who}
          </Mono>
          {nav.name !== 'compose' ? (
            <PrimaryButton size="$3" onPress={() => setNav({ name: 'compose' })}>
              + New entry
            </PrimaryButton>
          ) : null}
          <GhostButton size="$3" onPress={() => logout()}>
            Sign out
          </GhostButton>
        </XStack>
      </XStack>

      <YStack
        flex={1}
        width="100%"
        maxWidth={860}
        alignSelf="center"
        paddingHorizontal="$5"
        paddingVertical="$6"
      >
        {nav.name === 'feed' ? (
          <Feed onOpen={(id) => setNav({ name: 'detail', id })} onCompose={() => setNav({ name: 'compose' })} />
        ) : nav.name === 'detail' ? (
          <Detail
            id={nav.id}
            onBack={() => setNav({ name: 'feed' })}
            onOpen={(id) => setNav({ name: 'detail', id })}
          />
        ) : (
          <Compose onDone={() => setNav({ name: 'feed' })} onCancel={() => setNav({ name: 'feed' })} />
        )}
      </YStack>

      <XStack
        justifyContent="center"
        paddingVertical="$4"
        borderTopWidth={1}
        borderColor={ink.lineSoft}
      >
        <Text fontFamily={MONO} fontSize={11} color={ink.faint}>
          shipwright · @hanzo/gui · hanzo iam · hanzo base
        </Text>
      </XStack>
    </YStack>
  )
}
