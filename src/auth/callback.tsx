import { useEffect, useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, Spinner } from '@hanzo/gui'
import { ink, KINDS } from '../theme'
import { Mono, GhostButton } from '../ui'

/**
 * The PKCE return leg. hanzo.id redirects here with `?code=&state=`; the SDK
 * exchanges the code for tokens, then we land on the app root. On failure we
 * show the error and a way back rather than a blank spinner.
 */
export function Callback() {
  const { handleCallback } = useIam()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
      .then(() => window.location.replace('/'))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Sign-in failed'))
  }, [handleCallback])

  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" gap="$4" backgroundColor={ink.bg}>
      {error ? (
        <>
          <Mono color={KINDS.breaking.fg}>{error}</Mono>
          <GhostButton onPress={() => window.location.replace('/')}>← Back to sign in</GhostButton>
        </>
      ) : (
        <>
          <Spinner size="large" color={ink.lime} />
          <Mono color={ink.dim}>completing sign-in…</Mono>
        </>
      )}
    </YStack>
  )
}
