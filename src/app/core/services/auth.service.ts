import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, UserResponse } from '../models/models';

const TOKEN_KEY = 'amigo_invisible_token';
const USER_KEY = 'amigo_invisible_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly currentUserSignal = signal<UserResponse | null>(this.readStoredUser());
  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  constructor(private http: HttpClient, private router: Router) {}

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, { username, email, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  // Invalida el token del lado del servidor (asi no queda "vivo" en la base
  // hasta que expire solo) y despues limpia todo localmente.
  logout(): void {
    const hadToken = this.tokenSignal() !== null;

    const finish = () => {
      this.clearLocalSession();
      this.router.navigateByUrl('/login');
    };

    if (!hadToken) {
      finish();
      return;
    }

    this.http.delete(`${this.baseUrl}/logout`).subscribe({
      next: finish,
      error: finish, // si el backend no responde, igual cerramos sesion localmente
    });
  }

  // Para cuando el propio interceptor detecta un 401: no vuelve a pegarle
  // a la red (ese token ya no sirve), solo limpia el estado local.
  forceLocalLogout(): void {
    this.clearLocalSession();
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private clearLocalSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.tokenSignal.set(res.token);
    this.currentUserSignal.set(res.user);
  }

  private readStoredUser(): UserResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserResponse) : null;
  }
}
