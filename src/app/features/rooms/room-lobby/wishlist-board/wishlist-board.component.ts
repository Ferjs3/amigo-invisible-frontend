import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { ParticipantResponse, WishlistItem } from '../../../../core/models/models';

@Component({
  selector: 'app-wishlist-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wishlist-board.component.html',
  styleUrl: './wishlist-board.component.css',
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
