const LOCAL_STORAGE_KEYS = ["grabpic_token", "grabpic-token", "token", "authToken"];
const COOKIE_KEYS = ["grabpic_token", "grabpic-token", "token"];
const ACCESS_TOKEN_KEY = "grabpic_access_token";
const REFRESH_TOKEN_KEY = "grabpic_refresh_token";

/**
 * Get stored access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get stored refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Set access token in localStorage and cookies
 */
export function setAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  document.cookie = `${ACCESS_TOKEN_KEY}=${token}; path=/; max-age=${60 * 60}; SameSite=Lax`;
}

/**
 * Set refresh token in localStorage and cookies (7 day expiry)
 */
export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  document.cookie = `${REFRESH_TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

/**
 * Clear all auth tokens from localStorage and cookies
 */
export function clearAuthTokens(): void {
  if (typeof window === "undefined") {
    return;
  }

  // Clear new token keys
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;

  // Clear legacy keys for backward compatibility
  LOCAL_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });

  COOKIE_KEYS.forEach((key) => {
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  });
}

/**
 * Create session helper (deprecated - kept for backward compatibility)
 */
export function createMockSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  const token = `demo-${Date.now()}`;
  window.localStorage.setItem("grabpic_token", token);
  document.cookie = `grabpic_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

/**
 * Clear session helper (deprecated - now calls clearAuthTokens)
 */
export function clearMockSession(): void {
  clearAuthTokens();
}

/**
 * Check if user has valid auth session
 */
export function hasAuthSession(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const accessToken = getAccessToken();
  if (accessToken && accessToken.trim().length > 0) {
    return true;
  }

  // Check legacy tokens for backward compatibility
  const tokenInStorage = LOCAL_STORAGE_KEYS.some((key) => {
    const value = window.localStorage.getItem(key);
    return typeof value === "string" && value.trim().length > 0;
  });

  if (tokenInStorage) {
    return true;
  }

  const cookieSource = document.cookie;
  return COOKIE_KEYS.some((key) => new RegExp(`(?:^|; )${key}=`).test(cookieSource));
}
