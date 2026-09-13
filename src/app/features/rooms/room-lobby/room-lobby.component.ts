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
  templateUrl: './room-lobby.component.html',
  styleUrl: './room-lobby.component.css',
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
