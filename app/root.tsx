import { providers } from "ethers";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "remix";
import type { MetaFunction } from "remix";

// Imports
import { Connector, Provider, chain, defaultChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { WalletLinkConnector } from "wagmi/connectors/walletLink";

export function loader() {
  require("dotenv").config();
  return {
    infuraId: process.env.REMIX_INFURA_ID as string,
  };
}

export const meta: MetaFunction = () => {
  return { title: "Aipha" };
};

export default function App() {
  // Get environment variables
  const { infuraId } = useLoaderData();

  // Pick chains
  const chains = defaultChains;
  const defaultChain = chain.mainnet;

  // Set up connectors
  type ConnectorsConfig = { chainId?: number };
  const connectors = ({ chainId }: ConnectorsConfig) => {
    const rpcUrl =
      chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ??
      defaultChain.rpcUrls[0];
    return [
      new InjectedConnector({ chains, options: { shimDisconnect: true } }),
      new WalletConnectConnector({
        chains,
        options: {
          infuraId,
          qrcode: true,
        },
      }),
      new WalletLinkConnector({
        chains,
        options: {
          appName: "Aipha",
          jsonRpcUrl: `${rpcUrl}/${infuraId}`,
        },
      }),
    ];
  };

  // Set up providers
  type ProviderConfig = { chainId?: number; connector?: Connector };
  const isChainSupported = (chainId?: number) =>
    chains.some((x) => x.id === chainId);

  const provider = ({ chainId }: ProviderConfig) =>
    providers.getDefaultProvider(
      isChainSupported(chainId) ? chainId : defaultChain.id,
      {
        infura: infuraId,
      }
    );
  const webSocketProvider = ({ chainId }: ProviderConfig) =>
    isChainSupported(chainId)
      ? new providers.InfuraWebSocketProvider(chainId, infuraId)
      : undefined;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <script> var global = global || window; </script>
      </head>
      <body>
        <Provider
          autoConnect
          connectors={connectors}
          provider={provider}
          webSocketProvider={webSocketProvider}
        >
          <Outlet />
        </Provider>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
