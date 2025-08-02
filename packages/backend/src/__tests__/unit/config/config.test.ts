import { config } from '../../../config';

describe('Configuration', () => {
  it('should have correct environment setting', () => {
    expect(config.environment).toBe('test');
  });

  it('should have test JWT secret', () => {
    expect(config.jwt.secret).toBe('test-jwt-secret');
  });

  it('should have correct executor settings', () => {
    expect(config.executor.useNativeGo).toBe(false); // Should be false in test
  });

  it('should have docker configuration', () => {
    expect(config.docker).toBeDefined();
    expect(config.docker.memory).toBeDefined();
    expect(config.docker.timeout).toBeDefined();
  });

  it('should have AI assistance configuration', () => {
    expect(config.aiAssistance).toBeDefined();
    // In test environment, useExternalApi is false only if explicitly set
    expect(typeof config.aiAssistance.useExternalApi).toBe('boolean');
  });
});