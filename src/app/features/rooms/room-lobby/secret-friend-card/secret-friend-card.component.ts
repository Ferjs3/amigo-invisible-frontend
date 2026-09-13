import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../../core/services/room.service';

@Component({
  selector: 'app-secret-friend-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="font-display text-lg text-fg mb-1">Le vas a regalar a</h2>
    <p class="text-xs text-fg-muted mb-4">Sala sellada. Nadie más puede ver esta asignación.</p>

    @if (loading()) {
      <p class="text-sm text-fg-muted">Cargando…</p>
    } @else if (error()) {
      <p class="text-sm text-danger-dark">{{ error() }}</p>
    } @else {
      <div class="bg-primary rounded-2xl px-6 py-8 flex flex-col items-center gap-3.5">
        <span class="text-accent text-lg">🔒</span>
        <div class="font-display text-2xl text-surface min-h-[34px]" [ngClass]="revealed() ? '' : 'tracking-widest'">
          {{ revealed() ? name() : '• • • • • • • • • •' }}
        </div>
        <button
          (click)="revealed.set(!revealed())"
          class="flex items-center gap-2 border border-accent/60 text-accent rounded-full px-4 py-2 text-xs"
        >
          {{ revealed() ? 'Ocultar' : 'Revelar' }}
        </button>
      </div>
      <p class="text-xs text-fg-muted mt-3.5">
        Tip: revisá el tablón de sugerencias de {{ revealed() ? name() : 'tu amigo invisible' }} para tener ideas de regalo.
      </p>
    }
  `,
})
export class SecretFriendCardComponent implements OnInit {
  @Input({ required: true }) roomId!: number;

  revealed = signal(false);
  loading = signal(true);
  error = signal<string | null>(null);
  name = signal<string>('');

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.roomService.myAssignment(this.roomId).subscribe({
      next: (assignment) => {
        this.name.set(assignment.receiverUsername);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Todavía no se hizo el sorteo');
        this.loading.set(false);
      },
    });
  }
}
