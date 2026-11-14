// src/lib/env.ts
// Environment configuration with dual-mode support (mock vs firebase).
// In Vite, import.meta.env is populated from .env files and build environment.

export type BackendMode = 'mock' | 'firebase';
export type DataProviderType = 'mock' | 'firebase' | 'api';

export const env = {
  // Centralized Data Provider: 'mock' (default) | 'firebase' | 'api'
  DATA_PROVIDER: (import.meta.env.VITE_DATA_PROVIDER ?? import.meta.env.VITE_BACKEND_MODE ?? 'mock') as DataProviderType,

  // Future API Base URL (Phase 2 Aiven/Custom API)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '',

  // Backend storage & auth mode: 'mock' (default) | 'firebase' (legacy alias)
  BACKEND_MODE: (import.meta.env.VITE_BACKEND_MODE ?? 'mock') as BackendMode,

  // LLM mode: 'mock' (default) or 'live'
  LLM_MODE: (import.meta.env.VITE_LLM_MODE ?? 'mock') as 'mock' | 'live',
  // OpenAI key for live mode
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ?? '',
  // Model name for live mode
  LLM_MODEL: import.meta.env.VITE_LLM_MODEL ?? 'gpt-4o-mini',
  // Toggle Supabase draft storage
  USE_SUPABASE_DRAFTS: import.meta.env.VITE_USE_SUPABASE_DRAFTS ?? 'false',
  // Simple dev‑only admin guard (set to "true" to restrict admin UI to dev builds)
  ADMIN_ONLY_DEV: import.meta.env.VITE_ADMIN_ONLY_DEV ?? 'true',

  // Firebase Configuration (Project: dailyskill-9fed1)
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'dailyskill-9fed1.firebaseapp.com',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'dailyskill-9fed1',
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'dailyskill-9fed1.appspot.com',
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  USE_FIREBASE_EMULATOR: import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true',
};
