export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  total_acres?: number;
}

export function getToken(): string | null { return localStorage.getItem('agrivision_token'); }
export function setToken(t: string): void { localStorage.setItem('agrivision_token', t); }
export function clearToken(): void { localStorage.removeItem('agrivision_token'); localStorage.removeItem('agrivision_user'); }
export function setStoredUser(u: AuthUser): void { localStorage.setItem('agrivision_user', JSON.stringify(u)); }
export function getStoredUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem('agrivision_user') || 'null'); } catch { return null; }
}
