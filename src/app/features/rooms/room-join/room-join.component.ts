import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { RoomPreview } from '../../../core/models/models';

@Component({
  selector: 'app-room-join',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-plum-dark px-4 py-8">
      <div class="max-w-md mx-auto bg-paper rounded-2xl p-6">
        <a routerLink="/rooms" class="text-xs text-ink-soft">&larr; Volver</a>

        @if (!preview()) {
          <h1 class="font-display text-2xl text-ink mt-3 mb-1">Unirme a una sala</h1>
          <p class="text-sm text-ink-soft mb-5">Pedile el código a quien organiza el sorteo.</p>

          <label class="block mb-3">
            <span class="block text-xs text-ink-soft mb-1">Código de la sala</span>
            <input
              class="w-full text-sm px-3 py-2.5 rounded-lg border border-plum/20 bg-white text-ink uppercase"
              type="text"
              [(ngModel)]="code"
              name="code"
              placeholder="Ej: 7F3K9Q"
              maxlength="6"
            />
          </label>

          @if (error()) {
            <p class="text-coral-dark text-xs mb-3">{{ error() }}</p>
          }

          <button
            (click)="search()"
            [disabled]="loading() || code.trim().length < 4"
            class="w-full bg-gold disabled:opacity-50 text-plum-dark font-semibold text-sm rounded-lg py-2.5"
          >
            {{ loading() ? 'Buscando…' : 'Buscar sala' }}
          </button>
        } @else {
          <p class="text-xs text-ink-soft italic mt-3 mb-1">Encontramos esta sala</p>
          <h1 class="font-display text-2xl text-ink mb-4">{{ preview()!.name }}</h1>

          <div class="bg-paper-dim rounded-xl px-4 py-3 mb-5">
            <p class="text-sm text-ink mb-1.5">Organiza {{ preview()!.adminUsername }}</p>
            <div class="flex gap-3 text-xs text-ink-soft">
              <span>{{ preview()!.eventDate ?? 'sin fecha' }}</span>
              <span>{{ preview()!.participantCount }} anotados</span>
              @if (preview()!.suggestedBudget) {
                <span>hasta {{ '$' + preview()!.suggestedBudget }}</span>
              }
            </div>
          </div>

          @if (!preview()!.canJoin) {
            <p class="text-coral-dark text-xs mb-3">Esta sala ya sorteó, no se pueden sumar participantes.</p>
          }

          @if (error()) {
            <p class="text-coral-dark text-xs mb-3">{{ error() }}</p>
          }

          <button
            (click)="confirmJoin()"
            [disabled]="loading() || !preview()!.canJoin"
            class="w-full bg-gold disabled:opacity-50 text-plum-dark font-semibold text-sm rounded-lg py-2.5"
          >
            {{ loading() ? 'Uniéndote…' : 'Unirme a esta sala' }}
          </button>
        }
      </div>
    </div>
  `,
})
export class RoomJoinComponent {
  code = '';
  preview = signal<RoomPreview | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private roomService: RoomService, private router: Router) {}

  search(): void {
    this.loading.set(true);
    this.error.set(null);

    this.roomService.preview(this.code.trim().toUpperCase()).subscribe({
      next: (preview) => {
        this.loading.set(false);
        this.preview.set(preview);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No encontramos ninguna sala con ese código');
      },
    });
  }

  confirmJoin(): void {
    this.loading.set(true);
    this.error.set(null);

    this.roomService.join(this.code.trim().toUpperCase()).subscribe({
      next: (room) => {
        this.loading.set(false);
        this.router.navigate(['/rooms', room.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo unir a la sala');
      },
    });
  }
}
