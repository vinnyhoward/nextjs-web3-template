import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { WagmiConfig, createClient } from 'wagmi';
import { getDefaultProvider } from 'ethers';
import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme';

const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider {...{ theme }}>
      <WagmiConfig {...{ client }}>
        <Component {...pageProps} />
      </WagmiConfig>
    </ThemeProvider>
  );
}
