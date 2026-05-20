import { createConfig, http, type Config } from "wagmi";
import { metaMask, injected } from "wagmi/connectors";
import {
  celoMainnet,
  baseMainnet,
  polygonMainnet,
  celoSepolia,
} from "./chain";

export const wagmiConfig: Config = createConfig({
  chains: [celoMainnet, baseMainnet, polygonMainnet, celoSepolia],
  connectors: [
    injected({ target: "metaMask" }),  // MiniPay / Opera / injected wallets
    metaMask(),                          // MetaMask SDK (desktop/mobile deep-link)
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
