import { useCallback, useState } from 'react';
import type { Address, Hex } from 'viem';
import { useAccount, useSignTypedData } from 'wagmi';

import { APP_NAME, APP_VERSION, TARGET_NETWORKS } from '@/constants';
import { TYPES, type ChainOperation } from '@/lib/eip712-types';
import { hashChainOperation } from '@/lib/eip7964';

export type CrossChainSignResult = {
  /** The ChainOperation message data passed to the wallet, one per chain. */
  operations: ChainOperation[];
  /** Per-chain struct hashes — the `structsArray` in the on-chain blob. */
  structsArray: Hex[];
  /** The actual ECDSA signature returned by the wallet. */
  crossChainSignature: Hex;
  /** The signer address that produced the signature. */
  signer: Address;
  /** The signed value (for display + later submission). */
  value: bigint;
};

/**
 * Orchestrates the cross-chain signature flow:
 *
 * 1. Build a `ChainOperation` for each target network using its
 *    `chainId` and its `CrossChainAppMock` address as `verifyingContract`.
 * 2. Hash each operation locally via viem's `hashStruct` so we know the
 *    `structsArray` ahead of time.
 * 3. Ask the wallet to sign the `SetValue { ChainOperation[] }` message
 *    with a domain that omits `chainId` — the load-bearing trick of
 *    ERC-7964 that lets one signature satisfy three chains.
 */
export function useCrossChainSign() {
  const { address } = useAccount();
  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();
  const [result, setResult] = useState<CrossChainSignResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const sign = useCallback(
    async (args: { value: bigint; appAddresses: Record<number, Address> }) => {
      if (!address) throw new Error('Wallet not connected');
      setError(null);

      const operations: ChainOperation[] = TARGET_NETWORKS.map((network) => ({
        domain: {
          chainId: BigInt(network.chainId),
          verifyingContract: args.appAddresses[network.chainId],
        },
        value: args.value,
      }));

      const structsArray = operations.map(hashChainOperation);

      // Sanity check: surface configuration mistakes (e.g. duplicate chains)
      // before sending anything to the wallet.
      const uniqueHashes = new Set(structsArray);
      if (uniqueHashes.size !== structsArray.length) {
        throw new Error(
          'Two or more chain operations hashed to the same value. Check chain configuration.',
        );
      }

      try {
        // Domain MUST omit chainId for cross-chain validity (see ERC-7964
        // "Crosschain Domain Semantics"). We construct the object so the
        // key is absent rather than `undefined` — viem distinguishes
        // these when synthesising the EIP712Domain type.
        const crossChainSignature = await signTypedDataAsync({
          domain: { name: APP_NAME, version: APP_VERSION },
          types: TYPES,
          primaryType: 'SetValue',
          message: { operations },
        });

        const next: CrossChainSignResult = {
          operations,
          structsArray,
          crossChainSignature,
          signer: address,
          value: args.value,
        };
        setResult(next);
        return next;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        throw err;
      }
    },
    [address, signTypedDataAsync],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { sign, reset, result, error, isSigning };
}
