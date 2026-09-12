import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-plum-dark px-4">
      <div class="w-full max-w-sm bg-paper rounded-2xl p-7">
        <p class="font-display italic text-ink-soft text-xs mb-1">Amigo invisible</p>
        <h1 class="font-display text-2xl text-ink mb-5">Iniciar sesión</h1>

        <form (ngSubmit)="submit()" class="flex flex-col gap-3">
          <label class="block">
            <span class="block text-xs text-ink-soft mb-1">Usuario</span>
            <input
              class="w-full text-sm px-3 py-2.5 rounded-lg border border-plum/20 bg-white text-ink"
              type="text"
              [(ngModel)]="username"
              name="username"
              required
            />
          </label>
          <label class="block">
            <span class="block text-xs text-ink-soft mb-1">Contraseña</span>
            <div class="relative">
              <input
                class="w-full text-sm px-3 py-2.5 pr-10 rounded-lg border border-plum/20 bg-white text-ink"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                required
              />
              <button
                type="button"
                (click)="showPassword.set(!showPassword())"
                class="absolute right-0 top-0 h-full px-3 text-ink-soft text-xs"
                [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                {{ showPassword() ? '🙈' : '👁' }}
              </button>
            </div>
          </label>

          @if (error()) {
            <p class="text-coral-dark text-xs">{{ error() }}</p>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="mt-2 bg-gold hover:opacity-90 disabled:opacity-50 text-plum-dark font-semibold text-sm rounded-lg py-2.5"
          >
            {{ loading() ? 'Ingresando…' : 'Ingresar' }}
          </button>
        </form>

        <p class="text-xs text-ink-soft mt-5 text-center">
          ¿No tenés cuenta?
          <a routerLink="/register" class="text-plum font-semibold">Registrate</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  submit(): void {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/rooms';
        this.router.navigateByUrl(redirectTo);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo iniciar sesión');
      },
    });
  }
}
