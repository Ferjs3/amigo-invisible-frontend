import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, interval, switchMap } from 'rxjs';
import { RoomService } from '../../../core/services/room.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoomDetail } from '../../../core/models/models';
import { ParticipantsListComponent } from './participants-list/participants-list.component';
import { SecretFriendCardComponent } from './secret-friend-card/secret-friend-card.component';
import { WishlistBoardComponent } from './wishlist-board/wishlist-board.component';
import { QuestionsWallComponent } from './questions-wall/questions-wall.component';
import { ExclusionsManagerComponent } from './exclusions-manager/exclusions-manager.component';
import { BudgetVoteComponent } from './budget-vote/budget-vote.component';

type Tab = 'resumen' | 'amigo' | 'tablon' | 'preguntas';
type ConfirmAction = 'draw' | 'delete' | null;

const POLL_INTERVAL_MS = 6000;

@Component({
  selector: 'app-room-lobby',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ParticipantsListComponent,
    SecretFriendCardComponent,
    WishlistBoardComponent,
    QuestionsWallComponent,
    ExclusionsManagerComponent,
    BudgetVoteComponent,
  ],
  template: `
    @if (room()) {
      <div class="min-h-screen bg-plum-dark px-4 py-8">
        <div class="max-w-lg mx-auto">
          <!-- Header estilo ticket -->
          <div class="bg-paper rounded-t-2xl px-7 pt-6 pb-5 border-b-2 border-dashed border-plum/30">
            <div class="flex items-center justify-between">
              <a routerLink="/rooms" class="text-xs text-ink-soft">&larr; Mis salas</a>
              @if (room()!.isAdmin) {
                <button (click)="confirmAction.set('delete')" class="text-xs text-coral-dark">
                  Eliminar sala
                </button>
              }
            </div>
            <p class="font-display italic text-xs text-ink-soft mt-2">Sala de amigo invisible</p>
            <div class="flex items-start justify-between mt-1">
              <h1 class="font-display text-2xl text-ink">{{ room()!.name }}</h1>
              <button
                (click)="copyCode()"
                class="bg-plum text-gold rounded-lg px-3 py-1.5 font-display text-sm tracking-widest flex items-center gap-2"
                title="Copiar código"
              >
                {{ room()!.code }}
                <span class="text-[10px] font-sans tracking-normal opacity-80">
                  {{ copied() ? '✓ copiado' : '⧉' }}
                </span>
              </button>
            </div>
            <div class="flex flex-wrap gap-x-5 gap-y-1.5 mt-3.5 text-xs text-ink-soft">
              <span>{{ room()!.eventDate ? (room()!.eventDate | date: 'dd/MM/yyyy') : 'sin fecha' }}</span>
              <span>{{ room()!.place ?? 'sin lugar definido' }}</span>
              @if (room()!.suggestedBudget) {
                <span>hasta &#36;{{ room()!.suggestedBudget }}</span>
              }
            </div>
          </div>

          <!-- Tabs -->
          <div class="bg-paper flex px-5 border-b border-plum/10">
            @for (t of tabs; track t.id) {
              <button
                (click)="tab.set(t.id)"
                class="flex items-center gap-1.5 py-3 px-2.5 text-sm"
                [ngClass]="tab() === t.id ? 'text-plum font-semibold border-b-2 border-gold-dark' : 'text-ink-soft border-b-2 border-transparent'"
              >
                {{ t.label }}
              </button>
            }
          </div>

          @if (error()) {
            <div class="bg-paper px-7 py-2">
              <p class="text-xs text-coral-dark">{{ error() }}</p>
            </div>
          }

          <!-- Body -->
          <div class="bg-paper rounded-b-2xl px-7 pt-5 pb-7 min-h-[320px]">
            @switch (tab()) {
              @case ('resumen') {
                <app-participants-list
                  [participants]="room()!.participants"
                  [isAdmin]="room()!.isAdmin"
                  [roomOpen]="room()!.status === 'OPEN'"
                  (draw)="confirmAction.set('draw')"
                  (toggleReady)="onToggleReady($event)"
                  (removeParticipant)="onRemoveParticipant($event)"
                  (leave)="onLeave()"
                />
                <div class="mt-7 pt-5 border-t border-plum/10">
                  <app-budget-vote
                    [roomId]="room()!.id"
                    [isAdmin]="room()!.isAdmin"
                    [roomOpen]="room()!.status === 'OPEN'"
                  />
                </div>
                @if (room()!.isAdmin && room()!.status === 'OPEN') {
                  <div class="mt-7 pt-5 border-t border-plum/10">
                    <app-exclusions-manager [roomId]="room()!.id" [participants]="room()!.participants" />
                  </div>
                }
              }
              @case ('amigo') {
                @if (room()!.status === 'SEALED') {
                  <app-secret-friend-card [roomId]="room()!.id" />
                } @else {
                  <p class="text-sm text-ink-soft italic">Todavía no se hizo el sorteo en esta sala.</p>
                }
              }
              @case ('tablon') {
                <app-wishlist-board [roomId]="room()!.id" [participants]="room()!.participants" />
              }
              @case ('preguntas') {
                <app-questions-wall
                  [roomId]="room()!.id"
                  [roomSealed]="room()!.status === 'SEALED'"
                />
              }
            }
          </div>
        </div>
      </div>

      <!-- Modal de confirmacion (sorteo / eliminar sala) -->
      @if (confirmAction()) {
        <div class="fixed inset-0 bg-plum-dark/80 flex items-center justify-center px-4 z-50">
          <div class="bg-paper rounded-2xl p-6 max-w-sm w-full">
            @if (confirmAction() === 'draw') {
              <h2 class="font-display text-lg text-ink mb-2">¿Iniciar el sorteo?</h2>
              <p class="text-sm text-ink-soft mb-5">
                Esta acción es <strong>definitiva</strong>. Una vez que sortees, la lista de
                participantes queda bloqueada: nadie va a poder sumarse, salir ni ser eliminado.
              </p>
            } @else {
              <h2 class="font-display text-lg text-ink mb-2">¿Eliminar esta sala?</h2>
              <p class="text-sm text-ink-soft mb-5">
                Se borra por completo, junto con el tablón, las preguntas y el sorteo si ya se hizo.
                <strong>No se puede deshacer.</strong>
              </p>
            }
            <div class="flex gap-2">
              <button
                (click)="confirmAction.set(null)"
                class="flex-1 border border-plum/30 text-plum rounded-lg py-2.5 text-sm"
              >
                Cancelar
              </button>
              <button
                (click)="confirmAction() === 'draw' ? onDraw() : onDeleteRoom()"
                class="flex-1 bg-coral text-white rounded-lg py-2.5 text-sm font-semibold"
              >
                {{ confirmAction() === 'draw' ? 'Sí, sortear' : 'Sí, eliminar' }}
              </button>
            </div>
          </div>
        </div>
      }
    } @else if (error()) {
      <div class="min-h-screen flex items-center justify-center bg-plum-dark px-4">
        <p class="text-paper text-sm">{{ error() }}</p>
      </div>
    }
  `,
})
export class RoomLobbyComponent implements OnInit, OnDestroy {
  room = signal<RoomDetail | null>(null);
  error = signal<string | null>(null);
  tab = signal<Tab>('resumen');
  copied = signal(false);
  confirmAction = signal<ConfirmAction>(null);

  private roomId!: number;
  private pollSub?: Subscription;

  tabs: { id: Tab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'amigo', label: 'Mi amigo invisible' },
    { id: 'tablon', label: 'Tablón' },
    { id: 'preguntas', label: 'Preguntas' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private authService: AuthService
  ) {}

  currentUserId(): number | undefined {
    return this.authService.currentUser()?.id;
  }

  ngOnInit(): void {
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));
    this.load(this.roomId);
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  // Refresca la sala sola cada pocos segundos mientras el lobby esta abierto,
  // asi no hace falta recargar la pagina para ver participantes nuevos,
  // confirmaciones de "listo", expulsiones, etc.
  private startPolling(): void {
    this.pollSub = interval(POLL_INTERVAL_MS)
      .pipe(switchMap(() => this.roomService.getDetail(this.roomId)))
      .subscribe({
        next: (room) => this.room.set(room),
        error: () => {
          // si falla un polling puntual no rompemos la pantalla, se reintenta solo
        },
      });
  }

  load(roomId: number): void {
    this.roomService.getDetail(roomId).subscribe({
      next: (room) => this.room.set(room),
      error: (err) => this.error.set(err.error?.message ?? 'No se pudo cargar la sala'),
    });
  }

  copyCode(): void {
    const room = this.room();
    if (!room) return;
    navigator.clipboard.writeText(room.code).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    });
  }

  onDraw(): void {
    const room = this.room();
    if (!room) return;
    this.roomService.draw(room.id).subscribe({
      next: (updated) => {
        this.room.set(updated);
        this.confirmAction.set(null);
        this.tab.set('amigo');
      },
      error: (err) => {
        this.confirmAction.set(null);
        this.error.set(err.error?.message ?? 'No se pudo realizar el sorteo');
      },
    });
  }

  onDeleteRoom(): void {
    const room = this.room();
    if (!room) return;
    this.roomService.deleteRoom(room.id).subscribe({
      next: () => this.router.navigate(['/rooms']),
      error: (err) => {
        this.confirmAction.set(null);
        this.error.set(err.error?.message ?? 'No se pudo eliminar la sala');
      },
    });
  }

  onToggleReady(ready: boolean): void {
    const room = this.room();
    if (!room) return;
    this.roomService.setReady(room.id, ready).subscribe({
      next: (updated) => this.room.set(updated),
      error: (err) => this.error.set(err.error?.message ?? 'No se pudo actualizar tu estado'),
    });
  }

  onRemoveParticipant(userId: number): void {
    const room = this.room();
    if (!room) return;
    if (!confirm('¿Seguro que querés sacar a esta persona de la sala?')) return;

    this.roomService.removeParticipant(room.id, userId).subscribe({
      next: (updated) => this.room.set(updated),
      error: (err) => this.error.set(err.error?.message ?? 'No se pudo eliminar al participante'),
    });
  }

  onLeave(): void {
    const room = this.room();
    if (!room) return;
    if (!confirm('¿Seguro que querés salir de esta sala?')) return;

    this.roomService.leave(room.id).subscribe({
      next: () => this.router.navigate(['/rooms']),
      error: (err) => this.error.set(err.error?.message ?? 'No se pudo salir de la sala'),
    });
  }
}
