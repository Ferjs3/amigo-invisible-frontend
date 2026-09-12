import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { ParticipantResponse, WishlistItem } from '../../../../core/models/models';

@Component({
  selector: 'app-wishlist-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2 class="font-display text-lg text-ink mb-1">Tablón de sugerencias</h2>
    <p class="text-xs text-ink-soft mb-4">
      Cada uno gestiona su propia lista. Todos pueden verla, sirve de guía para regalar.
    </p>

    <div class="flex flex-col gap-4">
      @for (p of participants; track p.userId) {
        <div class="bg-paper-dim rounded-lg px-4 py-3.5">
          <p class="text-sm font-semibold text-ink mb-2">{{ p.username }}{{ p.isMe ? ' (vos)' : '' }}</p>

          <div class="flex flex-col gap-1.5">
            @for (item of itemsByUser[p.userId] ?? []; track item.id) {
              <div class="flex items-start justify-between text-sm text-ink">
                <span>
                  · {{ item.title }}
                  @if (item.note) {
                    <span class="text-ink-soft"> — {{ item.note }}</span>
                  }
                </span>
                @if (p.isMe) {
                  <button (click)="deleteItem(p.userId, item.id)" class="text-coral-dark text-xs ml-2 shrink-0">
                    Borrar
                  </button>
                }
              </div>
            }
            @if ((itemsByUser[p.userId] ?? []).length === 0) {
              <span class="text-xs text-ink-soft italic">Todavía no cargó ideas.</span>
            }
          </div>

          @if (p.isMe) {
            <div class="flex gap-2 mt-2.5">
              <input
                class="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-plum/20 bg-white text-ink"
                type="text"
                [(ngModel)]="newItemTitle"
                [name]="'newItem-' + p.userId"
                placeholder="Agregar una idea"
              />
              <button
                (click)="addItem(p.userId)"
                [disabled]="!newItemTitle.trim()"
                class="bg-plum disabled:opacity-40 text-paper rounded-lg px-3 text-sm"
              >
                Sumar
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class WishlistBoardComponent implements OnInit {
  @Input({ required: true }) roomId!: number;
  @Input({ required: true }) participants: ParticipantResponse[] = [];

  itemsByUser: Record<number, WishlistItem[]> = {};
  newItemTitle = '';

  constructor(private wishlistService: WishlistService) {}

  ngOnInit(): void {
    for (const p of this.participants) {
      this.wishlistService.getWishlist(this.roomId, p.userId).subscribe((items) => {
        this.itemsByUser[p.userId] = items;
      });
    }
  }

  addItem(userId: number): void {
    if (!this.newItemTitle.trim()) return;
    this.wishlistService.addItem(this.roomId, { title: this.newItemTitle.trim() }).subscribe((item) => {
      this.itemsByUser[userId] = [...(this.itemsByUser[userId] ?? []), item];
      this.newItemTitle = '';
    });
  }

  deleteItem(userId: number, itemId: number): void {
    this.wishlistService.deleteItem(this.roomId, itemId).subscribe(() => {
      this.itemsByUser[userId] = (this.itemsByUser[userId] ?? []).filter((i) => i.id !== itemId);
    });
  }
}
