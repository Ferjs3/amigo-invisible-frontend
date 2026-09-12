import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoomDetail } from '../../../core/models/models';
import { ParticipantsListComponent } from './participants-list/participants-list.component';
import { SecretFriendCardComponent } from './secret-friend-card/secret-friend-card.component';
import { WishlistBoardComponent } from './wishlist-board/wishlist-board.component';
import { QuestionsWallComponent } from './questions-wall/questions-wall.component';
import { ExclusionsManagerComponent } from './exclusions-manager/exclusions-manager.component';

type Tab = 'resumen' | 'amigo' | 'tablon' | 'preguntas';

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
  ],
  template: `
    @if (room()) {
      <div class="min-h-screen bg-plum-dark px-4 py-8">
        <div class="max-w-lg mx-auto">
          <!-- Header estilo ticket -->
          <div class="bg-paper rounded-t-2xl px-7 pt-6 pb-5 border-b-2 border-dashed border-plum/30">
            <a routerLink="/rooms" class="text-xs text-ink-soft">&larr; Mis salas</a>
            <p class="font-display italic text-xs text-ink-soft mt-2">Sala de amigo invisible</p>
            <div class="flex items-start justify-between mt-1">
              <h1 class="font-display text-2xl text-ink">{{ room()!.name }}</h1>
              <div class="bg-plum text-gold rounded-lg px-3 py-1.5 font-display text-sm tracking-widest">
                {{ room()!.code }}
              </div>
            </div>
            <div class="flex flex-wrap gap-x-5 gap-y-1.5 mt-3.5 text-xs text-ink-soft">
              <span>{{ room()!.eventDate ?? 'sin fecha' }}</span>
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
                  (draw)="onDraw()"
                />
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
                  [participants]="room()!.participants"
                  [currentUserId]="currentUserId()!"
                />
              }
            }
          </div>
        </div>
      </div>
    } @else if (error()) {
      <div class="min-h-screen flex items-center justify-center bg-plum-dark px-4">
        <p class="text-paper text-sm">{{ error() }}</p>
      </div>
    }
  `,
})
export class RoomLobbyComponent implements OnInit {
  room = signal<RoomDetail | null>(null);
  error = signal<string | null>(null);
  tab = signal<Tab>('resumen');

  tabs: { id: Tab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'amigo', label: 'Mi amigo invisible' },
    { id: 'tablon', label: 'Tablón' },
    { id: 'preguntas', label: 'Preguntas' },
  ];

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private authService: AuthService
  ) {}

  currentUserId(): number | undefined {
    return this.authService.currentUser()?.id;
  }

  ngOnInit(): void {
    const roomId = Number(this.route.snapshot.paramMap.get('id'));
    this.load(roomId);
  }

  load(roomId: number): void {
    this.roomService.getDetail(roomId).subscribe({
      next: (room) => this.room.set(room),
      error: (err) => this.error.set(err.error?.message ?? 'No se pudo cargar la sala'),
    });
  }

  onDraw(): void {
    const room = this.room();
    if (!room) return;
    this.roomService.draw(room.id).subscribe({
      next: (updated) => {
        this.room.set(updated);
        this.tab.set('amigo');
      },
      error: (err) => this.error.set(err.error?.message ?? 'No se pudo realizar el sorteo'),
    });
  }
}
