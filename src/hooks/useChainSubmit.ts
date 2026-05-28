import { useCallback, useState } from 'react';
import type { Address, Hex } from 'viem';
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from 'wagmi';

import { crossChainAppMockAbi } from '@/abi/CrossChainAppMock';
import { FIELDS, getAppAddress } from '@/constants';
import { buildPerChainSignature } from '@/lib/eip7964';

export type SubmitStatus =
  | { kind: 'idle' }
  | { kind: 'switching' }
  | { kind: 'pending'; hash: Hex }
  | { kind: 'confirmed'; hash: Hex; blockNumber: bigint }
  | { kind: 'failed'; error: Error };

export type SubmitArgs = {
  chainId: number;
  structIndex: number;
  structsArray: Hex[];
  crossChainSignature: Hex;
  signer: Address;
  value: bigint;
};

/**
 * Orchestrates a single per-chain submission of `setValue`. Builds the
 * chain-specific signature envelope (same `structsArray` and
 * `crossChainSignature`, different `header`) then switches chain +
 * broadcasts, pinning `chainId` to avoid wagmi's chain-switch race.
 */
export function useChainSubmit() {
  const { chainId: connectedChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [statusByChain, setStatusByChain] = useState<Record<number, SubmitStatus>>({});

  const getPublicClientForChain = usePublicClient;

  const setStatus = useCallback((chainId: number, status: SubmitStatus) => {
    setStatusByChain((prev) => ({ ...prev, [chainId]: status }));
  }, []);

  const submit = useCallback(
    async (args: SubmitArgs) => {
      const application = getAppAddress(args.chainId);

      const signature = buildPerChainSignature({
        fields: FIELDS,
        structIndex: args.structIndex,
        application,
        structsArray: args.structsArray,
        crossChainSignature: args.crossChainSignature,
      });

      try {
        if (connectedChainId !== args.chainId) {
          setStatus(args.chainId, { kind: 'switching' });
          await switchChainAsync({ chainId: args.chainId });
        }

        const hash = await writeContractAsync({
          chainId: args.chainId,
          address: application,
          abi: crossChainAppMockAbi,
          functionName: 'setValue',
          args: [args.signer, args.value, signature],
        });
        setStatus(args.chainId, { kind: 'pending', hash });
        return hash;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setStatus(args.chainId, { kind: 'failed', error: err });
        throw err;
      }
    },
    [connectedChainId, setStatus, switchChainAsync, writeContractAsync],
  );

  const markConfirmed = useCallback(
    (chainId: number, hash: Hex, blockNumber: bigint) => {
      setStatus(chainId, { kind: 'confirmed', hash, blockNumber });
    },
    [setStatus],
  );

  const reset = useCallback((chainId?: number) => {
    if (chainId === undefined) {
      setStatusByChain({});
    } else {
      setStatusByChain((prev) => {
        const next = { ...prev };
        delete next[chainId];
        return next;
      });
    }
  }, []);

  return { submit, statusByChain, markConfirmed, reset, getPublicClientForChain };
}
