import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';

@Component({
  selector: 'app-room-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-canvas px-4 py-8">
      <div class="max-w-md mx-auto bg-surface rounded-2xl p-6">
        <a routerLink="/rooms" class="text-xs text-fg-muted">&larr; Volver</a>
        <h1 class="font-display text-2xl text-fg mt-3 mb-5">Crear una sala</h1>

        @if (createdCode()) {
          <div class="text-center py-6">
            <p class="text-sm text-fg-muted mb-2">Sala creada. Compartí este código con tus invitados</p>
            <div class="inline-block bg-primary text-accent font-display text-2xl tracking-[6px] rounded-xl px-6 py-3 mb-6">
              {{ createdCode() }}
            </div>
            <button
              (click)="goToRoom()"
              class="w-full bg-accent text-canvas font-semibold text-sm rounded-lg py-2.5"
            >
              Ir a la sala
            </button>
          </div>
        } @else {
          <form (ngSubmit)="submit()" class="flex flex-col gap-3">
            <label class="block">
              <span class="block text-xs text-fg-muted mb-1">Nombre de la sala</span>
              <input
                class="w-full text-sm px-3 py-2.5 rounded-lg border border-primary/20 bg-white text-fg"
                type="text"
                [(ngModel)]="name"
                name="name"
                placeholder="Ej: Navidad con la familia"
                required
              />
            </label>
            <label class="block">
              <span class="block text-xs text-fg-muted mb-1">Presupuesto sugerido</span>
              <input
                class="w-full text-sm px-3 py-2.5 rounded-lg border border-primary/20 bg-white text-fg"
                type="number"
                [(ngModel)]="suggestedBudget"
                name="suggestedBudget"
                placeholder="Ej: 15000"
              />
            </label>
            <label class="block">
              <span class="block text-xs text-fg-muted mb-1">Fecha del evento</span>
              <input
                class="w-full text-sm px-3 py-2.5 rounded-lg border border-primary/20 bg-white text-fg"
                type="date"
                [(ngModel)]="eventDate"
                name="eventDate"
                [min]="minDate"
              />
            </label>
            <label class="block">
              <span class="block text-xs text-fg-muted mb-1">Lugar</span>
              <input
                class="w-full text-sm px-3 py-2.5 rounded-lg border border-primary/20 bg-white text-fg"
                type="text"
                [(ngModel)]="place"
                name="place"
                placeholder="Ej: Casa de Nacho"
              />
            </label>
            <label class="block">
              <span class="block text-xs text-fg-muted mb-1">Notas (opcional)</span>
              <textarea
                class="w-full text-sm px-3 py-2.5 rounded-lg border border-primary/20 bg-white text-fg"
                [(ngModel)]="notes"
                name="notes"
                rows="2"
              ></textarea>
            </label>

            @if (error()) {
              <p class="text-danger-dark text-xs">{{ error() }}</p>
            }

            <button
              type="submit"
              [disabled]="loading() || !name"
              class="mt-2 bg-accent disabled:opacity-50 text-canvas font-semibold text-sm rounded-lg py-2.5"
            >
              {{ loading() ? 'Creando…' : 'Crear sala' }}
            </button>
          </form>
        }
      </div>
    </div>
  `,
})
export class RoomCreateComponent {
  name = '';
  suggestedBudget: number | null = null;
  eventDate = '';
  place = '';
  notes = '';

  loading = signal(false);
  error = signal<string | null>(null);
  createdCode = signal<string | null>(null);
  createdRoomId: number | null = null;
  minDate = new Date().toISOString().split('T')[0];

  constructor(private roomService: RoomService, private router: Router) {}

  submit(): void {
    if (!this.name) return;
    this.loading.set(true);
    this.error.set(null);

    this.roomService
      .create({
        name: this.name,
        suggestedBudget: this.suggestedBudget,
        eventDate: this.eventDate || null,
        place: this.place || null,
        notes: this.notes || null,
      })
      .subscribe({
        next: (room) => {
          this.loading.set(false);
          this.createdCode.set(room.code);
          this.createdRoomId = room.id;
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'No se pudo crear la sala');
        },
      });
  }

  goToRoom(): void {
    if (this.createdRoomId) {
      this.router.navigate(['/rooms', this.createdRoomId]);
    }
  }
}
