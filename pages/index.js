// 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

import { Button, Code, Flex, Heading, Text } from '@chakra-ui/react'
import Head from 'next/head'

import { useAuth } from '@/lib/auth'

export default function Home() {
  const auth = useAuth()




  return (
    <Flex as="main" direction='column' align='center' justify='center' h='100vh' gap={4}>
      <Head>
        <title>Green IT</title>
      </Head>
      <Heading>
        Green IT
      </Heading>

      <Text>
        Current user: <Code>{auth.user ? auth.user.email : 'None'}</Code>
      </Text>
      {auth.user ? (
        <Button as="a" href="/dashboard">
          View Dashboard
        </Button>
      ) : (
        <Button mt={4} size="sm" onClick={(e) => auth.signInWithGoogle()}>
          Sign In
        </Button>
      )}
    </Flex>
  )
}
