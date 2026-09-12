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
    <div class="min-h-screen bg-plum-dark px-4 py-8">
      <div class="max-w-md mx-auto bg-paper rounded-2xl p-6">
        <a routerLink="/rooms" class="text-xs text-ink-soft">&larr; Volver</a>
        <h1 class="font-display text-2xl text-ink mt-3 mb-5">Crear una sala</h1>

        @if (createdCode()) {
          <div class="text-center py-6">
            <p class="text-sm text-ink-soft mb-2">Sala creada. Compartí este código con tus invitados</p>
            <div class="inline-block bg-plum text-gold font-display text-2xl tracking-[6px] rounded-xl px-6 py-3 mb-6">
              {{ createdCode() }}
            </div>
            <button
              (click)="goToRoom()"
              class="w-full bg-gold text-plum-dark font-semibold text-sm rounded-lg py-2.5"
            >
              Ir a la sala
            </button>
          </div>
        } @else {
          <form (ngSubmit)="submit()" class="flex flex-col gap-3">
            <label class="block">
              <span class="block text-xs text-ink-soft mb-1">Nombre de la sala</span>
              <input
                class="w-full text-sm px-3 py-2.5 rounded-lg border border-plum/20 bg-white text-ink"
                type="text"
                [(ngModel)]="name"
                name="name"
                placeholder="Ej: Navidad con la familia"
                required
              />
            </label>
            <label class="block">
              <span class="block text-xs text-ink-soft mb-1">Presupuesto sugerido</span>
              <input
                class="w-full text-sm px-3 py-2.5 rounded-lg border border-plum/20 bg-white text-ink"
                type="number"
                [(ngModel)]="suggestedBudget"
                name="suggestedBudget"
                placeholder="Ej: 15000"
              />
            </label>
            <label class="block">
              <span class="block text-xs text-ink-soft mb-1">Fecha del evento</span>
              <input
                class="w-full text-sm px-3 py-2.5 rounded-lg border border-plum/20 bg-white text-ink"
                type="date"
                [(ngModel)]="eventDate"
                name="eventDate"
                [min]="minDate"
              />
            </label>
            <label class="block">
              <span class="block text-xs text-ink-soft mb-1">Lugar</span>
              <input
                class="w-full text-sm px-3 py-2.5 rounded-lg border border-plum/20 bg-white text-ink"
                type="text"
                [(ngModel)]="place"
                name="place"
                placeholder="Ej: Casa de Nacho"
              />
            </label>
            <label class="block">
              <span class="block text-xs text-ink-soft mb-1">Notas (opcional)</span>
              <textarea
                class="w-full text-sm px-3 py-2.5 rounded-lg border border-plum/20 bg-white text-ink"
                [(ngModel)]="notes"
                name="notes"
                rows="2"
              ></textarea>
            </label>

            @if (error()) {
              <p class="text-coral-dark text-xs">{{ error() }}</p>
            }

            <button
              type="submit"
              [disabled]="loading() || !name"
              class="mt-2 bg-gold disabled:opacity-50 text-plum-dark font-semibold text-sm rounded-lg py-2.5"
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
