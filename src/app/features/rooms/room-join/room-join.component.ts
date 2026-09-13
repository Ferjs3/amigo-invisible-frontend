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
    <div class="min-h-screen bg-canvas px-4 py-8">
      <div class="max-w-md mx-auto bg-surface rounded-2xl p-6">
        <a routerLink="/rooms" class="text-xs text-fg-muted">&larr; Volver</a>

        @if (!preview()) {
          <h1 class="font-display text-2xl text-fg mt-3 mb-1">Unirme a una sala</h1>
          <p class="text-sm text-fg-muted mb-5">Pedile el código a quien organiza el sorteo.</p>

          <label class="block mb-3">
            <span class="block text-xs text-fg-muted mb-1">Código de la sala</span>
            <input
              class="w-full text-sm px-3 py-2.5 rounded-lg border border-primary/20 bg-white text-fg uppercase"
              type="text"
              [(ngModel)]="code"
              name="code"
              placeholder="Ej: 7F3K9Q"
              maxlength="6"
            />
          </label>

          @if (error()) {
            <p class="text-danger-dark text-xs mb-3">{{ error() }}</p>
          }

          <button
            (click)="search()"
            [disabled]="loading() || code.trim().length < 4"
            class="w-full bg-accent disabled:opacity-50 text-canvas font-semibold text-sm rounded-lg py-2.5"
          >
            {{ loading() ? 'Buscando…' : 'Buscar sala' }}
          </button>
        } @else {
          <p class="text-xs text-fg-muted italic mt-3 mb-1">Encontramos esta sala</p>
          <h1 class="font-display text-2xl text-fg mb-4">{{ preview()!.name }}</h1>

          <div class="bg-surface-dim rounded-xl px-4 py-3 mb-5">
            <p class="text-sm text-fg mb-1.5">Organiza {{ preview()!.adminUsername }}</p>
            <div class="flex gap-3 text-xs text-fg-muted">
              <span>{{ preview()!.eventDate ? (preview()!.eventDate | date: 'dd/MM/yyyy') : 'sin fecha' }}</span>
              <span>{{ preview()!.participantCount }} anotados</span>
              @if (preview()!.suggestedBudget) {
                <span>hasta {{ '$' + preview()!.suggestedBudget }}</span>
              }
            </div>
          </div>

          @if (!preview()!.canJoin) {
            <p class="text-danger-dark text-xs mb-3">Esta sala ya sorteó, no se pueden sumar participantes.</p>
          }

          @if (error()) {
            <p class="text-danger-dark text-xs mb-3">{{ error() }}</p>
          }

          <button
            (click)="confirmJoin()"
            [disabled]="loading() || !preview()!.canJoin"
            class="w-full bg-accent disabled:opacity-50 text-canvas font-semibold text-sm rounded-lg py-2.5"
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
