const LOCAL_STORAGE_KEYS = ["grabpic_token", "grabpic-token", "token", "authToken"];
const COOKIE_KEYS = ["grabpic_token", "grabpic-token", "token"];

export function hasAuthSession(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

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

export function createMockSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  const token = `demo-${Date.now()}`;
  window.localStorage.setItem("grabpic_token", token);
  document.cookie = `grabpic_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearMockSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  LOCAL_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });

  COOKIE_KEYS.forEach((key) => {
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  });
}
