import { createConfig, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import {
  celoMainnet,
  baseMainnet,
  polygonMainnet,
  celoSepolia,
} from "./chain";

const WC_PROJECT_ID =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID || "55218dcc95eb0de6ce4665a539b609c5";

export const wagmiConfig = createConfig({
  chains: [celoMainnet, baseMainnet, polygonMainnet, celoSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: WC_PROJECT_ID,
      showQrModal: true,
    }),
  ],
  transports: {
    [celoMainnet.id]: http(
      process.env.NEXT_PUBLIC_CELO_MAINNET_RPC || "https://forno.celo.org"
    ),
    [baseMainnet.id]: http(
      process.env.NEXT_PUBLIC_BASE_RPC || "https://mainnet.base.org"
    ),
    [polygonMainnet.id]: http(
      process.env.NEXT_PUBLIC_POLYGON_RPC || "https://polygon-bor-rpc.publicnode.com"
    ),
    [celoSepolia.id]: http(
      process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC ||
        "https://forno.celo-sepolia.celo-testnet.org/"
    ),
  },
  ssr: true,
});
