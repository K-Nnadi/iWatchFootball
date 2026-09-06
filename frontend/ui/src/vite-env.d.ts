/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_PAYLOAD_ENCRYPTION?: string;
  /** @deprecated Set to "true" to show the old Team A–L Matches demo instead of API fixtures. */
  readonly VITE_USE_DEPRECATED_MATCH_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

