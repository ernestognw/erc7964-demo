import type { TypedData } from 'viem';

/**
 * EIP-712 typed-data shapes consumed by `CrossChainAppMock`.
 *
 * We deliberately do NOT include an `EIP712Domain` entry. viem
 * synthesises that from the keys present on the `domain` object at call
 * time, which is how we end up with `fields = 0x03` (only `name` +
 * `version`, no `chainId`) — the load-bearing trick of ERC-7964.
 *
 * See https://eips.ethereum.org/EIPS/eip-7964 for the full spec.
 */
export const TYPES = {
  SetValue: [{ name: 'operations', type: 'ChainOperation[]' }],
  ChainOperation: [
    { name: 'domain', type: 'EIP712ChainDomain' },
    { name: 'value', type: 'uint256' },
  ],
  EIP712ChainDomain: [
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ],
} as const satisfies TypedData;

export type ChainOperation = {
  domain: { chainId: bigint; verifyingContract: `0x${string}` };
  value: bigint;
};
