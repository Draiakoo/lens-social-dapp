import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ThirdwebProvider } from "@thirdweb-dev/react";
import Header from '../components/Header';

export default function App({ Component, pageProps }: AppProps) {

  const queryClient = new QueryClient();

  return (
    <ThirdwebProvider activeChain="mumbai" clientId="f11daf52332ddcf433a4da2f445009a2">
      <QueryClientProvider client={queryClient}>
        <Header />
        <Component {...pageProps} />
      </QueryClientProvider>
    </ThirdwebProvider>
  )
}
