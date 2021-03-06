/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { licenseMock } from '../../common/licensing/index.mock';

jest.mock('./api_keys');
jest.mock('./authenticator');

import Boom from 'boom';

import {
  loggingSystemMock,
  coreMock,
  httpServerMock,
  httpServiceMock,
  elasticsearchServiceMock,
} from '../../../../../src/core/server/mocks';
import { mockAuthenticatedUser } from '../../common/model/authenticated_user.mock';
import { securityAuditLoggerMock } from '../audit/index.mock';

import {
  AuthenticationHandler,
  AuthToolkit,
  ILegacyClusterClient,
  CoreSetup,
  KibanaRequest,
  LoggerFactory,
  LegacyScopedClusterClient,
} from '../../../../../src/core/server';
import { AuthenticatedUser } from '../../common/model';
import { ConfigSchema, ConfigType, createConfig } from '../config';
import { AuthenticationResult } from './authentication_result';
import { Authentication, setupAuthentication } from '.';
import {
  CreateAPIKeyResult,
  CreateAPIKeyParams,
  InvalidateAPIKeyResult,
  InvalidateAPIKeyParams,
} from './api_keys';
import { SecurityLicense } from '../../common/licensing';
import { SecurityAuditLogger } from '../audit';
import { SecurityFeatureUsageServiceStart } from '../feature_usage';
import { securityFeatureUsageServiceMock } from '../feature_usage/index.mock';

describe('setupAuthentication()', () => {
  let mockSetupAuthenticationParams: {
    auditLogger: jest.Mocked<SecurityAuditLogger>;
    config: ConfigType;
    loggers: LoggerFactory;
    http: jest.Mocked<CoreSetup['http']>;
    clusterClient: jest.Mocked<ILegacyClusterClient>;
    license: jest.Mocked<SecurityLicense>;
    getFeatureUsageService: () => jest.Mocked<SecurityFeatureUsageServiceStart>;
  };
  let mockScopedClusterClient: jest.Mocked<PublicMethodsOf<LegacyScopedClusterClient>>;
  beforeEach(() => {
    mockSetupAuthenticationParams = {
      auditLogger: securityAuditLoggerMock.create(),
      http: coreMock.createSetup().http,
      config: createConfig(
        ConfigSchema.validate({
          encryptionKey: 'ab'.repeat(16),
          secureCookies: true,
          cookieName: 'my-sid-cookie',
        }),
        loggingSystemMock.create().get(),
        { isTLSEnabled: false }
      ),
      clusterClient: elasticsearchServiceMock.createClusterClient(),
      license: licenseMock.create(),
      loggers: loggingSystemMock.create(),
      getFeatureUsageService: jest
        .fn()
        .mockReturnValue(securityFeatureUsageServiceMock.createStartContract()),
    };

    mockScopedClusterClient = elasticsearchServiceMock.createScopedClusterClient();
    mockSetupAuthenticationParams.clusterClient.asScoped.mockReturnValue(
      (mockScopedClusterClient as unknown) as jest.Mocked<LegacyScopedClusterClient>
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('properly initializes session storage and registers auth handler', async () => {
    const config = {
      encryptionKey: 'ab'.repeat(16),
      secureCookies: true,
      cookieName: 'my-sid-cookie',
    };

    await setupAuthentication(mockSetupAuthenticationParams);

    expect(mockSetupAuthenticationParams.http.registerAuth).toHaveBeenCalledTimes(1);
    expect(mockSetupAuthenticationParams.http.registerAuth).toHaveBeenCalledWith(
      expect.any(Function)
    );

    expect(
      mockSetupAuthenticationParams.http.createCookieSessionStorageFactory
    ).toHaveBeenCalledTimes(1);
    expect(
      mockSetupAuthenticationParams.http.createCookieSessionStorageFactory
    ).toHaveBeenCalledWith({
      encryptionKey: config.encryptionKey,
      isSecure: config.secureCookies,
      name: config.cookieName,
      validate: expect.any(Function),
    });
  });

  describe('authentication handler', () => {
    let authHandler: AuthenticationHandler;
    let authenticate: jest.SpyInstance<Promise<AuthenticationResult>, [KibanaRequest]>;
    let mockAuthToolkit: jest.Mocked<AuthToolkit>;
    beforeEach(async () => {
      mockAuthToolkit = httpServiceMock.createAuthToolkit();

      await setupAuthentication(mockSetupAuthenticationParams);

      authHandler = mockSetupAuthenticationParams.http.registerAuth.mock.calls[0][0];
      authenticate = jest.requireMock('./authenticator').Authenticator.mock.instances[0]
        .authenticate;
    });

    it('replies with no credentials when security is disabled in elasticsearch', async () => {
      const mockRequest = httpServerMock.createKibanaRequest();
      const mockResponse = httpServerMock.createLifecycleResponseFactory();

      mockSetupAuthenticationParams.license.isEnabled.mockReturnValue(false);

      await authHandler(mockRequest, mockResponse, mockAuthToolkit);

      expect(mockAuthToolkit.authenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthToolkit.authenticated).toHaveBeenCalledWith();
      expect(mockAuthToolkit.redirected).not.toHaveBeenCalled();
      expect(mockResponse.internalError).not.toHaveBeenCalled();

      expect(authenticate).not.toHaveBeenCalled();
    });

    it('continues request with credentials on success', async () => {
      const mockRequest = httpServerMock.createKibanaRequest();
      const mockResponse = httpServerMock.createLifecycleResponseFactory();
      const mockUser = mockAuthenticatedUser();
      const mockAuthHeaders = { authorization: 'Basic xxx' };

      authenticate.mockResolvedValue(
        AuthenticationResult.succeeded(mockUser, { authHeaders: mockAuthHeaders })
      );

      await authHandler(mockRequest, mockResponse, mockAuthToolkit);

      expect(mockAuthToolkit.authenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthToolkit.authenticated).toHaveBeenCalledWith({
        state: mockUser,
        requestHeaders: mockAuthHeaders,
      });
      expect(mockAuthToolkit.redirected).not.toHaveBeenCalled();
      expect(mockResponse.internalError).not.toHaveBeenCalled();

      expect(authenticate).toHaveBeenCalledTimes(1);
      expect(authenticate).toHaveBeenCalledWith(mockRequest);
    });

    it('returns authentication response headers on success if any', async () => {
      const mockRequest = httpServerMock.createKibanaRequest();
      const mockResponse = httpServerMock.createLifecycleResponseFactory();
      const mockUser = mockAuthenticatedUser();
      const mockAuthHeaders = { authorization: 'Basic xxx' };
      const mockAuthResponseHeaders = { 'WWW-Authenticate': 'Negotiate' };

      authenticate.mockResolvedValue(
        AuthenticationResult.succeeded(mockUser, {
          authHeaders: mockAuthHeaders,
          authResponseHeaders: mockAuthResponseHeaders,
        })
      );

      await authHandler(mockRequest, mockResponse, mockAuthToolkit);

      expect(mockAuthToolkit.authenticated).toHaveBeenCalledTimes(1);
      expect(mockAuthToolkit.authenticated).toHaveBeenCalledWith({
        state: mockUser,
        requestHeaders: mockAuthHeaders,
        responseHeaders: mockAuthResponseHeaders,
      });
      expect(mockAuthToolkit.redirected).not.toHaveBeenCalled();
      expect(mockResponse.internalError).not.toHaveBeenCalled();

      expect(authenticate).toHaveBeenCalledTimes(1);
      expect(authenticate).toHaveBeenCalledWith(mockRequest);
    });

    it('redirects user if redirection is requested by the authenticator', async () => {
      const mockResponse = httpServerMock.createLifecycleResponseFactory();
      authenticate.mockResolvedValue(AuthenticationResult.redirectTo('/some/url'));

      await authHandler(httpServerMock.createKibanaRequest(), mockResponse, mockAuthToolkit);

      expect(mockAuthToolkit.redirected).toHaveBeenCalledTimes(1);
      expect(mockAuthToolkit.redirected).toHaveBeenCalledWith({
        location: '/some/url',
      });
      expect(mockAuthToolkit.authenticated).not.toHaveBeenCalled();
      expect(mockResponse.internalError).not.toHaveBeenCalled();
    });

    it('rejects with `Internal Server Error` and log error when `authenticate` throws unhandled exception', async () => {
      const mockResponse = httpServerMock.createLifecycleResponseFactory();
      authenticate.mockRejectedValue(new Error('something went wrong'));

      await authHandler(httpServerMock.createKibanaRequest(), mockResponse, mockAuthToolkit);

      expect(mockResponse.internalError).toHaveBeenCalledTimes(1);
      const [[error]] = mockResponse.internalError.mock.calls;
      expect(error).toBeUndefined();

      expect(mockAuthToolkit.authenticated).not.toHaveBeenCalled();
      expect(mockAuthToolkit.redirected).not.toHaveBeenCalled();
      expect(loggingSystemMock.collect(mockSetupAuthenticationParams.loggers).error)
        .toMatchInlineSnapshot(`
        Array [
          Array [
            [Error: something went wrong],
          ],
        ]
      `);
    });

    it('rejects with original `badRequest` error when `authenticate` fails to authenticate user', async () => {
      const mockResponse = httpServerMock.createLifecycleResponseFactory();
      const esError = Boom.badRequest('some message');
      authenticate.mockResolvedValue(AuthenticationResult.failed(esError));

      await authHandler(httpServerMock.createKibanaRequest(), mockResponse, mockAuthToolkit);

      expect(mockResponse.customError).toHaveBeenCalledTimes(1);
      const [[response]] = mockResponse.customError.mock.calls;
      expect(response.body).toBe(esError);

      expect(mockAuthToolkit.authenticated).not.toHaveBeenCalled();
      expect(mockAuthToolkit.redirected).not.toHaveBeenCalled();
    });

    it('includes `WWW-Authenticate` header if `authenticate` fails to authenticate user and provides challenges', async () => {
      const mockResponse = httpServerMock.createLifecycleResponseFactory();
      const originalError = Boom.unauthorized('some message');
      originalError.output.headers['WWW-Authenticate'] = [
        'Basic realm="Access to prod", charset="UTF-8"',
        'Basic',
        'Negotiate',
      ] as any;
      authenticate.mockResolvedValue(
        AuthenticationResult.failed(originalError, {
          authResponseHeaders: { 'WWW-Authenticate': 'Negotiate' },
        })
      );

      await authHandler(httpServerMock.createKibanaRequest(), mockResponse, mockAuthToolkit);

      expect(mockResponse.customError).toHaveBeenCalledTimes(1);
      const [[options]] = mockResponse.customError.mock.calls;
      expect(options.body).toBe(originalError);
      expect(options!.headers).toEqual({ 'WWW-Authenticate': 'Negotiate' });

      expect(mockAuthToolkit.authenticated).not.toHaveBeenCalled();
      expect(mockAuthToolkit.redirected).not.toHaveBeenCalled();
    });

    it('returns `notHandled` when authentication can not be handled', async () => {
      const mockResponse = httpServerMock.createLifecycleResponseFactory();
      authenticate.mockResolvedValue(AuthenticationResult.notHandled());

      await authHandler(httpServerMock.createKibanaRequest(), mockResponse, mockAuthToolkit);

      expect(mockAuthToolkit.notHandled).toHaveBeenCalledTimes(1);

      expect(mockAuthToolkit.authenticated).not.toHaveBeenCalled();
      expect(mockAuthToolkit.redirected).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser()', () => {
    let getCurrentUser: (r: KibanaRequest) => AuthenticatedUser | null;
    beforeEach(async () => {
      getCurrentUser = (await setupAuthentication(mockSetupAuthenticationParams)).getCurrentUser;
    });

    it('returns `null` if Security is disabled', () => {
      mockSetupAuthenticationParams.license.isEnabled.mockReturnValue(false);

      expect(getCurrentUser(httpServerMock.createKibanaRequest())).toBe(null);
    });

    it('returns user from the auth state.', () => {
      const mockUser = mockAuthenticatedUser();

      const mockAuthGet = mockSetupAuthenticationParams.http.auth.get as jest.Mock;
      mockAuthGet.mockReturnValue({ state: mockUser });

      const mockRequest = httpServerMock.createKibanaRequest();
      expect(getCurrentUser(mockRequest)).toBe(mockUser);
      expect(mockAuthGet).toHaveBeenCalledTimes(1);
      expect(mockAuthGet).toHaveBeenCalledWith(mockRequest);
    });

    it('returns null if auth state is not available.', () => {
      const mockAuthGet = mockSetupAuthenticationParams.http.auth.get as jest.Mock;
      mockAuthGet.mockReturnValue({});

      const mockRequest = httpServerMock.createKibanaRequest();
      expect(getCurrentUser(mockRequest)).toBeNull();
      expect(mockAuthGet).toHaveBeenCalledTimes(1);
      expect(mockAuthGet).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('isAuthenticated()', () => {
    let isAuthenticated: (r: KibanaRequest) => boolean;
    beforeEach(async () => {
      isAuthenticated = (await setupAuthentication(mockSetupAuthenticationParams)).isAuthenticated;
    });

    it('returns `true` if request is authenticated', () => {
      const mockIsAuthenticated = mockSetupAuthenticationParams.http.auth
        .isAuthenticated as jest.Mock;
      mockIsAuthenticated.mockReturnValue(true);

      const mockRequest = httpServerMock.createKibanaRequest();
      expect(isAuthenticated(mockRequest)).toBe(true);
      expect(mockIsAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockIsAuthenticated).toHaveBeenCalledWith(mockRequest);
    });

    it('returns `false` if request is not authenticated', () => {
      const mockIsAuthenticated = mockSetupAuthenticationParams.http.auth
        .isAuthenticated as jest.Mock;
      mockIsAuthenticated.mockReturnValue(false);

      const mockRequest = httpServerMock.createKibanaRequest();
      expect(isAuthenticated(mockRequest)).toBe(false);
      expect(mockIsAuthenticated).toHaveBeenCalledTimes(1);
      expect(mockIsAuthenticated).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('createAPIKey()', () => {
    let createAPIKey: (
      request: KibanaRequest,
      params: CreateAPIKeyParams
    ) => Promise<CreateAPIKeyResult | null>;
    beforeEach(async () => {
      createAPIKey = (await setupAuthentication(mockSetupAuthenticationParams)).createAPIKey;
    });

    it('calls createAPIKey with given arguments', async () => {
      const request = httpServerMock.createKibanaRequest();
      const apiKeysInstance = jest.requireMock('./api_keys').APIKeys.mock.instances[0];
      const params = {
        name: 'my-key',
        role_descriptors: {},
        expiration: '1d',
      };
      apiKeysInstance.create.mockResolvedValueOnce({ success: true });
      await expect(createAPIKey(request, params)).resolves.toEqual({
        success: true,
      });
      expect(apiKeysInstance.create).toHaveBeenCalledWith(request, params);
    });
  });

  describe('grantAPIKeyAsInternalUser()', () => {
    let grantAPIKeyAsInternalUser: (request: KibanaRequest) => Promise<CreateAPIKeyResult | null>;
    beforeEach(async () => {
      grantAPIKeyAsInternalUser = (await setupAuthentication(mockSetupAuthenticationParams))
        .grantAPIKeyAsInternalUser;
    });

    it('calls grantAsInternalUser', async () => {
      const request = httpServerMock.createKibanaRequest();
      const apiKeysInstance = jest.requireMock('./api_keys').APIKeys.mock.instances[0];
      apiKeysInstance.grantAsInternalUser.mockResolvedValueOnce({ api_key: 'foo' });
      await expect(grantAPIKeyAsInternalUser(request)).resolves.toEqual({
        api_key: 'foo',
      });
      expect(apiKeysInstance.grantAsInternalUser).toHaveBeenCalledWith(request);
    });
  });

  describe('invalidateAPIKey()', () => {
    let invalidateAPIKey: (
      request: KibanaRequest,
      params: InvalidateAPIKeyParams
    ) => Promise<InvalidateAPIKeyResult | null>;
    beforeEach(async () => {
      invalidateAPIKey = (await setupAuthentication(mockSetupAuthenticationParams))
        .invalidateAPIKey;
    });

    it('calls invalidateAPIKey with given arguments', async () => {
      const request = httpServerMock.createKibanaRequest();
      const apiKeysInstance = jest.requireMock('./api_keys').APIKeys.mock.instances[0];
      const params = {
        id: '123',
      };
      apiKeysInstance.invalidate.mockResolvedValueOnce({ success: true });
      await expect(invalidateAPIKey(request, params)).resolves.toEqual({
        success: true,
      });
      expect(apiKeysInstance.invalidate).toHaveBeenCalledWith(request, params);
    });
  });

  describe('invalidateAPIKeyAsInternalUser()', () => {
    let invalidateAPIKeyAsInternalUser: Authentication['invalidateAPIKeyAsInternalUser'];

    beforeEach(async () => {
      invalidateAPIKeyAsInternalUser = (await setupAuthentication(mockSetupAuthenticationParams))
        .invalidateAPIKeyAsInternalUser;
    });

    it('calls invalidateAPIKeyAsInternalUser with given arguments', async () => {
      const apiKeysInstance = jest.requireMock('./api_keys').APIKeys.mock.instances[0];
      const params = {
        id: '123',
      };
      apiKeysInstance.invalidateAsInternalUser.mockResolvedValueOnce({ success: true });
      await expect(invalidateAPIKeyAsInternalUser(params)).resolves.toEqual({
        success: true,
      });
      expect(apiKeysInstance.invalidateAsInternalUser).toHaveBeenCalledWith(params);
    });
  });
});
