
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_REFLECTION_MAX_CHARS: int;
  readonly VITE_REFLECTION_MIN_CHARS: int;

  // Add more VITE_ variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}