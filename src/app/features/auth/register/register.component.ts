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
    <div class="min-h-screen flex items-center justify-center bg-plum-dark px-4">
      <div class="w-full max-w-sm bg-paper rounded-2xl p-7">
        <p class="font-display italic text-ink-soft text-xs mb-1">Amigo invisible</p>
        <h1 class="font-display text-2xl text-ink mb-5">Crear cuenta</h1>

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
            <span class="block text-xs text-ink-soft mb-1">Email</span>
            <input
              class="w-full text-sm px-3 py-2.5 rounded-lg border border-plum/20 bg-white text-ink"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
            />
          </label>
          <label class="block">
            <span class="block text-xs text-ink-soft mb-1">Contraseña</span>
            <input
              class="w-full text-sm px-3 py-2.5 rounded-lg border border-plum/20 bg-white text-ink"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              minlength="6"
            />
          </label>

          @if (error()) {
            <p class="text-coral-dark text-xs">{{ error() }}</p>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="mt-2 bg-gold hover:opacity-90 disabled:opacity-50 text-plum-dark font-semibold text-sm rounded-lg py-2.5"
          >
            {{ loading() ? 'Creando cuenta…' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="text-xs text-ink-soft mt-5 text-center">
          ¿Ya tenés cuenta?
          <a routerLink="/login" class="text-plum font-semibold">Iniciá sesión</a>
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
