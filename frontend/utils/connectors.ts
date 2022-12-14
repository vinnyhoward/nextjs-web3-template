/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

const walletconnect = new WalletConnectConnector({
  // rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURANEXT_PUBLIC_INFURA_KEY_KEY}`,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
});

const walletlink = new WalletLinkConnector({
  url: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`,
  appName: 'web3-react-demo',
});

export const connectors: { [key: string]: any } = {
  injected: injected,
  walletConnect: walletconnect,
  coinbaseWallet: walletlink,
};
