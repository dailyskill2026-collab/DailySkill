/**
 * Sprint 16: Centralized Data Provider Configuration & Factory
 * Enforces safe provider selection, prevents accidental cloud network requests,
 * and maintains 100% Mock mode by default.
 */

import { env } from './env';
import { ServiceUnavailableError } from '@/errors/AppErrors';

export type DataProviderType = 'mock' | 'firebase' | 'api';

export interface DataProviderConfig {
  provider: DataProviderType;
  isMock: boolean;
  isCloudConnected: boolean;
  supportedProviders: DataProviderType[];
}

const SUPPORTED_PROVIDERS: DataProviderType[] = ['mock', 'firebase', 'api'];

export function getDataProviderConfig(): DataProviderConfig {
  const configuredProvider = (env.DATA_PROVIDER || 'mock').toLowerCase() as DataProviderType;

  // Validate provider selection
  if (!SUPPORTED_PROVIDERS.includes(configuredProvider)) {
    throw new ServiceUnavailableError(
      `Unsupported DATA_PROVIDER: '${configuredProvider}'. Supported providers: ${SUPPORTED_PROVIDERS.join(', ')}`
    );
  }

  // Safety guardrail for future unconfigured providers
  if (configuredProvider === 'api' && !env.API_BASE_URL) {
    throw new ServiceUnavailableError(
      "DATA_PROVIDER is configured to 'api' but VITE_API_BASE_URL is not set"
    );
  }

  if (configuredProvider === 'firebase' && (!env.FIREBASE_API_KEY || !env.FIREBASE_PROJECT_ID)) {
    throw new ServiceUnavailableError(
      "DATA_PROVIDER is configured to 'firebase' but Firebase credentials are not configured"
    );
  }

  return {
    provider: configuredProvider,
    isMock: configuredProvider === 'mock',
    isCloudConnected: configuredProvider !== 'mock',
    supportedProviders: SUPPORTED_PROVIDERS,
  };
}

export const activeDataProvider = getDataProviderConfig();
