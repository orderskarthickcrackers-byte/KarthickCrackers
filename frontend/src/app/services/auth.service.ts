import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  role: string;
  expiresAt: string;
}

export interface UserInfo {
  userId: number;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'kc_admin_token';
  private readonly USER_KEY = 'kc_admin_user';
  private readonly API_URL = `${environment.apiUrl}/auth`;

  currentUser = signal<UserInfo | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap({
        next: (res) => {
          if (res && res.token) {
            this.setSession(res);
          }
        },
        error: (err) => {
          console.error('AuthService login error:', err);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return this.token() || localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getMe(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.API_URL}/me`);
  }

  private setSession(authResult: LoginResponse): void {
    const userInfo: UserInfo = {
      userId: authResult.userId,
      email: authResult.email,
      role: authResult.role
    };

    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));

    this.token.set(authResult.token);
    this.currentUser.set(userInfo);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): UserInfo | null {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }
}
