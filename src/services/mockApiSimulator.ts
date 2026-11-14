/**
 * Sprint 16: Mock API Simulation & Fault Injection Harness
 * Enables testing UI error boundaries, retry loops, and latency handling
 * without requiring real cloud servers or live network connections.
 */

import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
} from '@/errors/AppErrors';

export type SimulatedFaultMode =
  | 'none'
  | 'network_error'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limit'
  | 'timeout';

export interface SimulatorConfig {
  latencyMs: number;
  faultMode: SimulatedFaultMode;
  failureRate: number; // 0.0 to 1.0 (probability of injecting fault)
}

export class MockApiSimulator {
  private static instance: MockApiSimulator;

  private config: SimulatorConfig = {
    latencyMs: 0,
    faultMode: 'none',
    failureRate: 1.0,
  };

  static getInstance(): MockApiSimulator {
    if (!MockApiSimulator.instance) {
      MockApiSimulator.instance = new MockApiSimulator();
    }
    return MockApiSimulator.instance;
  }

  setLatency(ms: number): void {
    this.config.latencyMs = Math.max(0, ms);
  }

  setFaultMode(mode: SimulatedFaultMode, failureRate = 1.0): void {
    this.config.faultMode = mode;
    this.config.failureRate = Math.min(1.0, Math.max(0.0, failureRate));
  }

  reset(): void {
    this.config = {
      latencyMs: 0,
      faultMode: 'none',
      failureRate: 1.0,
    };
  }

  getConfig(): Readonly<SimulatorConfig> {
    return { ...this.config };
  }

  async execute<T>(operation: () => Promise<T> | T): Promise<T> {
    // 1. Simulate Latency if configured
    if (this.config.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.config.latencyMs));
    }

    // 2. Inject Fault if active
    if (this.config.faultMode !== 'none') {
      const shouldTrigger = Math.random() <= this.config.failureRate;
      if (shouldTrigger) {
        switch (this.config.faultMode) {
          case 'network_error':
            throw new ServiceUnavailableError('Network connection lost. Please check your internet connectivity.');
          case 'unauthorized':
            throw new UnauthorizedError('Session expired. Please sign in again.');
          case 'forbidden':
            throw new ForbiddenError('You do not have permission to access this resource.');
          case 'not_found':
            throw new NotFoundError('Requested entity');
          case 'conflict':
            throw new ConflictError('A resource with this identifier already exists.');
          case 'rate_limit':
            throw new RateLimitError('Too many requests. Please slow down.', 30);
          case 'timeout':
            throw new ServiceUnavailableError('Request timed out after waiting for upstream service.');
        }
      }
    }

    // 3. Normal execution
    return operation();
  }
}

export const mockApiSimulator = MockApiSimulator.getInstance();
