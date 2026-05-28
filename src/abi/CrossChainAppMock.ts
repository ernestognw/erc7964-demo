/**
 * Minimal ABI for CrossChainAppMock (only the methods + events we use).
 * Source: `contracts/CrossChainAppMock.sol` in this repo.
 */
export const crossChainAppMockAbi = [
  {
    type: 'function',
    name: 'setValue',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'value_', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'value',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'eip712Domain',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'fields', type: 'bytes1' },
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
      { name: 'extensions', type: 'uint256[]' },
    ],
  },
  {
    type: 'event',
    name: 'ValueSet',
    inputs: [
      { name: 'account', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
] as const;
