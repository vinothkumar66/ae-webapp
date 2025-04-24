import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'auth_token';
  private userDetails = 'user_details';

  constructor() {}

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  setAuthUser(user: string): void {
    localStorage.setItem(this.userDetails, user);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getAuthUser(): string | null {
    return localStorage.getItem(this.userDetails);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
