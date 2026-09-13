import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoomSummary } from '../../../core/models/models';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-canvas px-4 py-8">
      <div class="max-w-lg mx-auto bg-surface rounded-2xl p-6">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-display italic text-fg-muted text-xs">Amigo invisible</span>
        </div>
        <div class="flex items-start justify-between mb-5">
          <h1 class="font-display text-2xl text-fg">Hola, {{ authService.currentUser()?.username }}</h1>
          <button (click)="authService.logout()" class="text-xs text-fg-muted underline mt-2">
            Cerrar sesión
          </button>
        </div>

        <div class="flex gap-2 mb-6">
          <a
            routerLink="/rooms/new"
            class="flex-1 flex items-center justify-center gap-2 bg-primary text-surface rounded-xl py-3 text-sm"
          >
            + Crear sala
          </a>
          <a
            routerLink="/rooms/join"
            class="flex-1 flex items-center justify-center gap-2 border border-primary/40 text-primary rounded-xl py-3 text-sm"
          >
            Unirme con código
          </a>
        </div>

        <h2 class="font-display text-base text-fg mb-2">Tus salas</h2>

        @if (loading()) {
          <p class="text-sm text-fg-muted">Cargando…</p>
        } @else if (rooms().length === 0) {
          <p class="text-sm text-fg-muted italic">Todavía no sos parte de ninguna sala.</p>
        } @else {
          <div class="flex flex-col gap-2.5">
            @for (room of rooms(); track room.id) {
              <a
                [routerLink]="['/rooms', room.id]"
                class="block bg-surface-dim rounded-xl px-4 py-3 hover:opacity-90"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-semibold text-fg">{{ room.name }}</p>
                    <p class="text-xs text-fg-muted mt-0.5">
                      {{ room.isAdmin ? 'Sos el admin' : 'Participante' }}
                    </p>
                  </div>
                  <span
                    class="text-[11px] px-2.5 py-1 rounded-full"
                    [ngClass]="statusClasses(room.status)"
                  >
                    {{ statusLabel(room.status) }}
                  </span>
                </div>
                <div class="flex gap-3 mt-2 text-xs text-fg-muted">
                  <span>{{ room.eventDate ? (room.eventDate | date: 'dd/MM/yyyy') : 'sin fecha' }}</span>
                  <span>{{ room.participantCount }} personas</span>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class RoomListComponent implements OnInit {
  rooms = signal<RoomSummary[]>([]);
  loading = signal(true);

  constructor(private roomService: RoomService, public authService: AuthService) {}

  ngOnInit(): void {
    this.roomService.myRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(status: string): string {
    if (status === 'OPEN') return 'Abierta';
    if (status === 'SEALED') return 'Sellada';
    return 'Descartada';
  }

  statusClasses(status: string): string {
    if (status === 'OPEN') return 'bg-[#E4EDE6] text-success-dark';
    if (status === 'SEALED') return 'bg-[#EFE6C7] text-accent-dark';
    return 'bg-[#F3E3DC] text-danger-dark';
  }
}
