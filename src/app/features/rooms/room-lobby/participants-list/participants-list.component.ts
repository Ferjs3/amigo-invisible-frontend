import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantResponse } from '../../../../core/models/models';

@Component({
  selector: 'app-participants-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="font-display text-lg text-fg mb-1">Participantes</h2>
    <p class="text-xs text-fg-muted mb-4">
      {{ readyCount() }} de {{ participants.length }} confirmaron que están listos.
    </p>

    <div class="flex flex-col gap-2">
      @for (p of participants; track p.userId) {
        <div class="flex items-center justify-between bg-surface-dim rounded-lg px-3.5 py-2.5">
          <span class="text-sm text-fg">{{ p.username }}{{ p.isMe ? ' (vos)' : '' }}</span>

          <div class="flex items-center gap-2">
            @if (p.isMe && roomOpen) {
              <button
                (click)="toggleReady.emit(p.status !== 'READY')"
                class="text-xs px-2.5 py-1 rounded-full border"
                [ngClass]="p.status === 'READY' ? 'bg-[#E4EDE6] text-success-dark border-success/30' : 'bg-[#F3E3DC] text-danger-dark border-danger/30'"
              >
                {{ p.status === 'READY' ? 'Listo ✓' : 'Marcarme listo' }}
              </button>
            } @else {
              <span
                class="text-xs px-2 py-1 rounded-full"
                [ngClass]="p.status === 'READY' ? 'bg-[#E4EDE6] text-success-dark' : 'bg-[#F3E3DC] text-danger-dark'"
              >
                {{ p.status === 'READY' ? 'Listo' : 'Pendiente' }}
              </span>
            }

            @if (isAdmin && !p.isMe && roomOpen) {
              <button
                (click)="removeParticipant.emit(p.userId)"
                class="text-xs text-danger-dark"
                title="Eliminar de la sala"
              >
                Eliminar
              </button>
            }
          </div>
        </div>
      }
    </div>

    @if (!isAdmin && roomOpen) {
      <button
        (click)="leave.emit()"
        class="mt-4 text-xs text-danger-dark underline"
      >
        Salir de la sala
      </button>
    }

    @if (isAdmin) {
      <div class="mt-5 bg-primary rounded-lg px-4 py-3.5">
        <p class="text-xs text-surface/85">
          El sorteo se habilita con al menos 3 participantes y todos en estado listo.
        </p>
        <button
          (click)="draw.emit()"
          [disabled]="!canDraw()"
          class="mt-2.5 w-full bg-accent disabled:opacity-40 text-canvas font-semibold text-sm rounded-lg py-2.5"
        >
          {{ canDraw() ? 'Iniciar sorteo' : 'Esperando a todos' }}
        </button>
      </div>
    }
  `,
})
export class ParticipantsListComponent {
  @Input({ required: true }) participants: ParticipantResponse[] = [];
  @Input() isAdmin = false;
  @Input() roomOpen = true;

  @Output() draw = new EventEmitter<void>();
  @Output() toggleReady = new EventEmitter<boolean>();
  @Output() removeParticipant = new EventEmitter<number>();
  @Output() leave = new EventEmitter<void>();

  readyCount(): number {
    return this.participants.filter((p) => p.status === 'READY').length;
  }

  canDraw(): boolean {
    return this.participants.length >= 3 && this.participants.every((p) => p.status === 'READY');
  }
}
