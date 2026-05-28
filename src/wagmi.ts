import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, type Chain } from 'viem';
import { arbitrumSepolia, baseSepolia, sepolia } from 'viem/chains';

import { TARGET_NETWORKS } from './constants';

const WC_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo';

/**
 * Map each target network's `chainId` → RPC URL, using the
 * `@openzeppelin/adapter-evm` default and allowing per-chain overrides
 * via env (`VITE_RPC_*`). Public testnet RPCs rate-limit aggressively,
 * so users running the demo should plug in their own.
 */
const RPC_OVERRIDES: Record<number, string | undefined> = {
  [TARGET_NETWORKS[0].chainId]: import.meta.env.VITE_RPC_SEPOLIA,
  [TARGET_NETWORKS[1].chainId]: import.meta.env.VITE_RPC_ARBITRUM_SEPOLIA,
  [TARGET_NETWORKS[2].chainId]: import.meta.env.VITE_RPC_BASE_SEPOLIA,
};

// Use the canonical viem `Chain` constants for the three target
// testnets. The adapter's `viemChain` field on each `EvmNetworkConfig`
// references these same objects but is typed loosely, so we re-import
// the strict viem chains to satisfy RainbowKit's tuple type.
const chains: readonly [Chain, ...Chain[]] = [sepolia, arbitrumSepolia, baseSepolia];

const transports = Object.fromEntries(
  TARGET_NETWORKS.map((n) => [
    n.chainId,
    http(RPC_OVERRIDES[n.chainId] || n.rpcUrl),
  ]),
);

export const wagmiConfig = getDefaultConfig({
  appName: 'ERC-7964 Cross-Chain Signature Demo',
  projectId: WC_PROJECT_ID,
  chains: chains as [Chain, ...Chain[]],
  transports,
  ssr: false,
});
