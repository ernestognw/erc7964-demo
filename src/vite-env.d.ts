/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_RPC_SEPOLIA?: string;
  readonly VITE_RPC_ARBITRUM_SEPOLIA?: string;
  readonly VITE_RPC_BASE_SEPOLIA?: string;
  readonly VITE_APP_SEPOLIA?: string;
  readonly VITE_APP_ARBITRUM_SEPOLIA?: string;
  readonly VITE_APP_BASE_SEPOLIA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
