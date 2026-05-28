import {
  arbitrumSepolia,
  baseSepolia,
  ethereumSepolia,
} from '@openzeppelin/adapter-evm';
import type { Address, Hex } from 'viem';

/**
 * Three OpenZeppelin-curated testnet configurations from
 * `@openzeppelin/adapter-evm`. Each carries the canonical RPC URL,
 * explorer URL, native currency, icon component, and an embedded viem
 * `Chain` reference — so we don't duplicate the catalog locally.
 */
export const TARGET_NETWORKS = [
  ethereumSepolia,
  arbitrumSepolia,
  baseSepolia,
] as const;

export type TargetNetwork = (typeof TARGET_NETWORKS)[number];

/**
 * Addresses of `CrossChainAppMock` deployed on each target chain. Run
 * `script/Deploy.s.sol` once per chain (see the README) and paste the
 * resulting addresses into `.env`.
 *
 * Reads from `import.meta.env.VITE_APP_*` so the same build can target
 * different deployments without rebuilding.
 */
const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000';

export const APP_ADDRESSES: Record<number, Address> = {
  [ethereumSepolia.chainId]:
    (import.meta.env.VITE_APP_SEPOLIA as Address) || ZERO_ADDRESS,
  [arbitrumSepolia.chainId]:
    (import.meta.env.VITE_APP_ARBITRUM_SEPOLIA as Address) || ZERO_ADDRESS,
  [baseSepolia.chainId]:
    (import.meta.env.VITE_APP_BASE_SEPOLIA as Address) || ZERO_ADDRESS,
};

/**
 * EIP-712 fields byte (per ERC-5267): bit 0 = name present, bit 1 =
 * version present. We omit `chainId`, `verifyingContract`, `salt`. The
 * `CrossChainAppMock` constructor sets name + version, so fields = 0x03.
 */
export const FIELDS: Hex = '0x03';

/**
 * Domain `name` + `version` used by every `CrossChainAppMock` instance
 * (see its constructor in CrossChainAppMock.sol).
 */
export const APP_NAME = 'CrossChainAppMock';
export const APP_VERSION = '1.0.0';

export function getAppAddress(chainId: number): Address {
  const addr = APP_ADDRESSES[chainId];
  if (!addr || addr === ZERO_ADDRESS) {
    throw new Error(
      `No CrossChainAppMock address configured for chain ${chainId}. Set VITE_APP_* in .env.`,
    );
  }
  return addr;
}

export function isAppDeployed(chainId: number): boolean {
  const addr = APP_ADDRESSES[chainId];
  return Boolean(addr) && addr !== ZERO_ADDRESS;
}
