import {
  concatHex,
  encodeAbiParameters,
  hashStruct,
  pad,
  toHex,
  type Address,
  type Hex,
} from 'viem';

import { TYPES, type ChainOperation } from './eip712-types';

/** First 9 bytes of an ERC-7964 signature envelope. */
export const ERC7964_MAGIC: Hex = '0x796479647964796479';

/**
 * Pack the 32-byte header that prefixes every ERC-7964 signature blob.
 * Layout: magic (9B) | fields (1B) | structIndex (2B, big-endian) | application (20B).
 *
 * See https://eips.ethereum.org/EIPS/eip-7964 ("On-Chain Verification").
 */
export function encodeERC7964Header(
  fields: Hex,
  structIndex: number,
  application: Address,
): Hex {
  return concatHex([
    ERC7964_MAGIC,
    fields,
    pad(toHex(structIndex), { size: 2 }),
    application,
  ]);
}

/** Hash a single ChainOperation using viem's typed-data primitives. */
export function hashChainOperation(operation: ChainOperation): Hex {
  return hashStruct({
    data: operation,
    primaryType: 'ChainOperation',
    types: TYPES,
  });
}

/**
 * Bundle a per-chain header + the shared structsArray + the shared
 * crossChainSignature into the ABI-encoded blob that gets passed to
 * `setValue(account, value, signature)` on-chain.
 */
export function buildErc7964Signature(
  header: Hex,
  structsArray: Hex[],
  crossChainSignature: Hex,
): Hex {
  return encodeAbiParameters(
    [{ type: 'bytes32' }, { type: 'bytes32[]' }, { type: 'bytes' }],
    [header, structsArray, crossChainSignature],
  );
}

/**
 * Convenience: given the cross-chain signing artefacts, build the
 * per-chain signature blob ready for submission on a given chain.
 */
export function buildPerChainSignature(args: {
  fields: Hex;
  structIndex: number;
  application: Address;
  structsArray: Hex[];
  crossChainSignature: Hex;
}): Hex {
  const header = encodeERC7964Header(args.fields, args.structIndex, args.application);
  return buildErc7964Signature(header, args.structsArray, args.crossChainSignature);
}
