import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { RoomPreview } from '../../../core/models/models';

@Component({
  selector: 'app-room-join',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './room-join.component.html',
  styleUrl: './room-join.component.css',
})
export class RoomJoinComponent {
  code = '';
  preview = signal<RoomPreview | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private roomService: RoomService, private router: Router) {}

  search(): void {
    this.loading.set(true);
    this.error.set(null);

    this.roomService.preview(this.code.trim().toUpperCase()).subscribe({
      next: (preview) => {
        this.loading.set(false);
        this.preview.set(preview);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No encontramos ninguna sala con ese código');
      },
    });
  }

  confirmJoin(): void {
    this.loading.set(true);
    this.error.set(null);

    this.roomService.join(this.code.trim().toUpperCase()).subscribe({
      next: (room) => {
        this.loading.set(false);
        this.router.navigate(['/rooms', room.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo unir a la sala');
      },
    });
  }
}
