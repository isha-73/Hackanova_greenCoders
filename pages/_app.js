import { ChakraProvider, CSSReset } from '@chakra-ui/react'
import { Global, css } from '@emotion/react'

import { AuthProvider } from '@/lib/auth'
import customTheme from '@/styles/theme'

const GlobalStyle = ({ children }) => {
  return (
    <>
      <CSSReset />
      <Global
        styles={css`
          html {
            min-width: 360px;
            scroll-behavior: smooth;
          }
          #__next {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
        `}
      />
      {children}
    </>
  );
};

export default function App({ Component, pageProps }) {
  return <ChakraProvider theme={customTheme}>
    <GlobalStyle />
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  </ChakraProvider>
}
