import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearAuthTokens } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') || '';

export function getApiBaseUrl(): string {
  return BASE_URL;
}

export function buildApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/api/') ? endpoint.slice(4) : endpoint;
  const apiBase = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;
  return `${apiBase}${normalizedEndpoint}`;
}

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

/**
 * Centralized API client with automatic Bearer token injection and 401 refresh logic
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private buildUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint.startsWith('/api/') ? endpoint.slice(4) : endpoint;
    const apiBase = this.baseUrl.endsWith('/api') ? this.baseUrl : `${this.baseUrl}/api`;
    return `${apiBase}${normalizedEndpoint}`;
  }

  private getAuthHeader(): string | null {
    const token = getAccessToken();
    return token ? `Bearer ${token}` : null;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthTokens();
        return false;
      }

      const response = await fetch(this.buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        clearAuthTokens();
        return false;
      }

      const data = await response.json();
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return true;
    } catch (error) {
      console.error('[ApiClient] Token refresh error:', error);
      clearAuthTokens();
      return false;
    }
  }

  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<[T | null, ApiResponse<T>]> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers = new Headers(fetchOptions.headers);
    headers.set('Content-Type', 'application/json');

    if (!skipAuth) {
      const authHeader = this.getAuthHeader();
      if (authHeader) {
        headers.set('Authorization', authHeader);
      }
    }

    let response = await fetch(this.buildUrl(endpoint), {
      ...fetchOptions,
      headers,
    });

    // Handle 401 Unauthorized - attempt refresh
    if (response.status === 401 && !skipAuth) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry request with new token
        const authHeader = this.getAuthHeader();
        if (authHeader) {
          headers.set('Authorization', authHeader);
        }
        response = await fetch(this.buildUrl(endpoint), {
          ...fetchOptions,
          headers,
        });
      }
    }

    // Handle 401 after refresh attempt - redirect to login on next navigation
    if (response.status === 401) {
      clearAuthTokens();
      // Redirect will be handled by middleware or page logic
      return [null, { status: 401, error: 'Unauthorized' }];
    }

    let responseData: any = null;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch {
      responseData = null;
    }

    return [
      response.ok ? responseData : null,
      {
        status: response.status,
        data: response.ok ? responseData : undefined,
        error: !response.ok ? responseData?.message || 'Request failed' : undefined,
      },
    ];
  }

  // Convenience methods
  get<T = any>(endpoint: string, options?: ApiRequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options?: ApiRequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Form data request (for multipart uploads)
  async postFormData<T = any>(
    endpoint: string,
    formData: FormData,
    options?: Omit<ApiRequestOptions, 'headers' | 'body'>
  ): Promise<[T | null, ApiResponse<T>]> {
    const headers = new Headers();

    if (!options?.skipAuth) {
      const authHeader = this.getAuthHeader();
      if (authHeader) {
        headers.set('Authorization', authHeader);
      }
    }

    let response = await fetch(this.buildUrl(endpoint), {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    });

    // Handle 401 Unauthorized - attempt refresh
    if (response.status === 401 && !options?.skipAuth) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        const authHeader = this.getAuthHeader();
        if (authHeader) {
          headers.set('Authorization', authHeader);
        }
        response = await fetch(this.buildUrl(endpoint), {
          ...options,
          method: 'POST',
          headers,
          body: formData,
        });
      }
    }

    if (response.status === 401) {
      clearAuthTokens();
      return [null, { status: 401, error: 'Unauthorized' }];
    }

    let responseData: any = null;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      }
    } catch {
      responseData = null;
    }

    return [
      response.ok ? responseData : null,
      {
        status: response.status,
        data: response.ok ? responseData : undefined,
        error: !response.ok ? responseData?.message || 'Request failed' : undefined,
      },
    ];
  }
}

export const apiClient = new ApiClient();
