# ERC-7964 Cross-Chain Signature Demo

A small interactive React app that shows what's novel about [ERC-7964](https://eips.ethereum.org/EIPS/eip-7964): **one EIP-712 signature, authorized once, valid on multiple chains**.

You connect a wallet, type a `uint256`, sign one typed-data message, and then submit the resulting signature to a `CrossChainAppMock` on three testnets — Sepolia, Arbitrum Sepolia, and Base Sepolia. For each chain, the UI visualizes how the on-chain `bytes` blob is composed differently (the `structIndex` and `application` segments of the 32-byte header change per chain) while the `crossChainSignature` and `structsArray` stay identical across all three.

## What this demonstrates

- **Domain without `chainId`**: the top-level EIP-712 `domain` carries only `name` + `version`. The per-chain `chainId`s live inside each `ChainOperation` so the signer reviews and authorizes the concrete set of target chains in the wallet popup.
- **`structsArray` + `structIndex`**: each chain receives the full array of operation hashes and the index of *its* operation, encoded into a 32-byte header. On-chain, the contract reconstructs the EIP-712 hash with that array and verifies the signature locally.
- **Standard EIP-712 wallet display**: no custom wallet support required — any wallet that already shows EIP-712 typed data shows the cross-chain message correctly.

## Repository layout

```
erc-7964-demo/
├── contracts/                    # Solidity sources
│   ├── CrossChainSignatureChecker.sol   # ERC-7964 verifier library
│   └── CrossChainAppMock.sol            # Minimal target: setValue(uint256)
├── script/
│   └── Deploy.s.sol              # Foundry deploy script
├── src/                          # React app (Vite + TS + shadcn + wagmi + RainbowKit)
│   ├── lib/                      # eip712-types + eip7964 encoding helpers
│   ├── hooks/                    # useCrossChainSign, useChainSubmit
│   ├── components/               # 3-tab wizard + per-chain card + header byte strip
│   └── ...
├── foundry.toml
├── remappings.txt
└── package.json
```

## Prerequisites

- Node 20+, [pnpm](https://pnpm.io)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- A funded testnet EOA with ~0.001 ETH on Sepolia, Arbitrum Sepolia, and Base Sepolia
- (Optional) a [WalletConnect Cloud](https://cloud.walletconnect.com) project ID

## Setup

```sh
# install JS + Solidity deps
pnpm install
forge install foundry-rs/forge-std --no-git   # if you cloned with --depth and no submodules

# verify the contracts compile
forge build
```

## Deploy the mock to each testnet

The demo points at a `CrossChainAppMock` instance on each target chain. Deploy it once per chain:

```sh
export PRIVATE_KEY=0x...

forge script script/Deploy.s.sol \
  --rpc-url $RPC_SEPOLIA --private-key $PRIVATE_KEY --broadcast

forge script script/Deploy.s.sol \
  --rpc-url $RPC_ARBITRUM_SEPOLIA --private-key $PRIVATE_KEY --broadcast

forge script script/Deploy.s.sol \
  --rpc-url $RPC_BASE_SEPOLIA --private-key $PRIVATE_KEY --broadcast
```

Each invocation prints the deployed address. The addresses do *not* need to match across chains — each `ChainOperation` carries its own `verifyingContract`, so ERC-7964 handles per-chain divergence.

## Configure the frontend

```sh
cp .env.example .env
```

Fill in:

| Variable | Purpose |
| --- | --- |
| `VITE_WALLETCONNECT_PROJECT_ID` | Get one at https://cloud.walletconnect.com |
| `VITE_RPC_SEPOLIA` / `_ARBITRUM_SEPOLIA` / `_BASE_SEPOLIA` | Optional RPC overrides — public RPCs rate-limit aggressively |
| `VITE_APP_SEPOLIA` / `_ARBITRUM_SEPOLIA` / `_BASE_SEPOLIA` | Addresses from the deploy step above |

## Run it

```sh
pnpm dev
```

Open http://localhost:5173, connect a wallet, type a value, sign once, then submit on each chain.

## What to look for in the UI

- **Sign tab — typed-data preview**: the JSON the wallet will display. Look at `domain` — it has only `name` and `version`. No `chainId`. That is the load-bearing trick.
- **Submit tab — header byte strip**: each chain card shows a 32-byte horizontal strip with four colored segments. The **red pulsing bytes 10–11** (`structIndex`) and **purple bytes 12–31** (`application`) change between cards. The gray + blue (`magic`, `fields`) and the shared `structsArray` table are identical across cards.
- **Submit tab — Diff legend**: spells out what's identical vs different so you don't have to squint.

## Faucets

- Sepolia: https://sepoliafaucet.com or https://www.alchemy.com/faucets/ethereum-sepolia
- Arbitrum Sepolia: https://www.alchemy.com/faucets/arbitrum-sepolia
- Base Sepolia: https://www.alchemy.com/faucets/base-sepolia (stingier — may require bridging from Sepolia)

## Out of scope

- **Replay protection**. `CrossChainAppMock` has no nonce. The same signature can be replayed on the same chain forever — by design, since cross-chain replay is the *feature*. Real applications must add their own nonce or deadline (see ERC-7964 "Security Considerations").
- **Relayer / gasless submission**. The demo uses EOA submission via wagmi's `useWriteContract`. Adding a relayer path is a future exercise.
- **ERC-1271 / smart-account signers**. `CrossChainSignatureChecker` supports them, but the demo signs with the connected EOA.

## Wallet compatibility

EIP-712 typed data with no `chainId` in the domain is permitted by the spec, and MetaMask + Rabby + recent Coinbase Wallet sign it fine. Older Coinbase Wallet versions rejected it — if your wallet refuses, switch.

## Credits

- ERC spec: [`OpenZeppelin/ERCs` → `erc-7964.md`](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7964.md) (also https://eips.ethereum.org/EIPS/eip-7964)
- Chain catalog and wallet UX patterns from [`@openzeppelin/adapter-evm`](https://github.com/OpenZeppelin/openzeppelin-adapters)
- Wallet + chain switching via [wagmi](https://wagmi.sh) + [viem](https://viem.sh) + [RainbowKit](https://rainbowkit.com)
- Solidity utilities from [`@openzeppelin/contracts`](https://github.com/OpenZeppelin/openzeppelin-contracts)
