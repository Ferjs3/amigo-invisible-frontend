import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WishlistItem } from '../models/models';

export interface WishlistItemPayload {
  title: string;
  note?: string | null;
  url?: string | null;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  constructor(private http: HttpClient) {}

  private base(roomId: number): string {
    return `${environment.apiUrl}/rooms/${roomId}/wishlist`;
  }

  getWishlist(roomId: number, userId: number): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(`${this.base(roomId)}/${userId}`);
  }

  addItem(roomId: number, payload: WishlistItemPayload): Observable<WishlistItem> {
    return this.http.post<WishlistItem>(this.base(roomId), payload);
  }

  updateItem(roomId: number, itemId: number, payload: WishlistItemPayload): Observable<WishlistItem> {
    return this.http.put<WishlistItem>(`${this.base(roomId)}/${itemId}`, payload);
  }

  deleteItem(roomId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.base(roomId)}/${itemId}`);
  }
}
