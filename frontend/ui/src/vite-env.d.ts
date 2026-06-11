/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_PAYLOAD_ENCRYPTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

