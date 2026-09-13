import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div class="w-full max-w-sm bg-surface rounded-2xl p-7">
        <p class="font-display italic text-fg-muted text-xs mb-1">Amigo invisible</p>
        <h1 class="font-display text-2xl text-fg mb-5">Crear cuenta</h1>

        <form (ngSubmit)="submit()" class="flex flex-col gap-3">
          <label class="block">
            <span class="block text-xs text-fg-muted mb-1">Usuario</span>
            <input
              class="w-full text-sm px-3 py-2.5 rounded-lg border border-primary/20 bg-white text-fg"
              type="text"
              [(ngModel)]="username"
              name="username"
              required
            />
          </label>
          <label class="block">
            <span class="block text-xs text-fg-muted mb-1">Email</span>
            <input
              class="w-full text-sm px-3 py-2.5 rounded-lg border border-primary/20 bg-white text-fg"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
            />
          </label>
          <label class="block">
            <span class="block text-xs text-fg-muted mb-1">Contraseña</span>
            <div class="relative">
              <input
                class="w-full text-sm px-3 py-2.5 pr-10 rounded-lg border border-primary/20 bg-white text-fg"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                required
                minlength="6"
              />
              <button
                type="button"
                (click)="showPassword.set(!showPassword())"
                class="absolute right-0 top-0 h-full px-3 text-fg-muted text-xs"
                [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                {{ showPassword() ? '🙈' : '👁' }}
              </button>
            </div>
          </label>

          @if (error()) {
            <p class="text-danger-dark text-xs">{{ error() }}</p>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="mt-2 bg-accent hover:opacity-90 disabled:opacity-50 text-canvas font-semibold text-sm rounded-lg py-2.5"
          >
            {{ loading() ? 'Creando cuenta…' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="text-xs text-fg-muted mt-5 text-center">
          ¿Ya tenés cuenta?
          <a routerLink="/login" class="text-primary font-semibold">Iniciá sesión</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  submit(): void {
    if (!this.username || !this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/rooms'),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo crear la cuenta');
      },
    });
  }
}
