import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantResponse } from '../../../../core/models/models';

@Component({
  selector: 'app-participants-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="font-display text-lg text-ink mb-1">Participantes</h2>
    <p class="text-xs text-ink-soft mb-4">
      {{ readyCount() }} de {{ participants.length }} confirmaron que están listos.
    </p>

    <div class="flex flex-col gap-2">
      @for (p of participants; track p.userId) {
        <div class="flex items-center justify-between bg-paper-dim rounded-lg px-3.5 py-2.5">
          <span class="text-sm text-ink">{{ p.username }}{{ p.isMe ? ' (vos)' : '' }}</span>
          <span
            class="text-xs px-2 py-1 rounded-full"
            [ngClass]="p.status === 'READY' ? 'bg-[#E4EDE6] text-pine-dark' : 'bg-[#F3E3DC] text-coral-dark'"
          >
            {{ p.status === 'READY' ? 'Listo' : 'Pendiente' }}
          </span>
        </div>
      }
    </div>

    @if (isAdmin) {
      <div class="mt-5 bg-plum rounded-lg px-4 py-3.5">
        <p class="text-xs text-paper/85">
          El sorteo se habilita con al menos 3 participantes y todos en estado listo.
        </p>
        <button
          (click)="draw.emit()"
          [disabled]="!canDraw()"
          class="mt-2.5 w-full bg-gold disabled:opacity-40 text-plum-dark font-semibold text-sm rounded-lg py-2.5"
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
  @Output() draw = new EventEmitter<void>();

  readyCount(): number {
    return this.participants.filter((p) => p.status === 'READY').length;
  }

  canDraw(): boolean {
    return this.participants.length >= 3 && this.participants.every((p) => p.status === 'READY');
  }
}
