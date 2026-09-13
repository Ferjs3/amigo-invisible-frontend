import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';

@Component({
  selector: 'app-room-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './room-create.component.html',
  styleUrl: './room-create.component.css',
})
export class RoomCreateComponent {
  name = '';
  suggestedBudget: number | null = null;
  eventDate = '';
  place = '';
  notes = '';

  loading = signal(false);
  error = signal<string | null>(null);
  createdCode = signal<string | null>(null);
  createdRoomId: number | null = null;
  minDate = new Date().toISOString().split('T')[0];

  constructor(private roomService: RoomService, private router: Router) {}

  submit(): void {
    if (!this.name) return;
    this.loading.set(true);
    this.error.set(null);

    this.roomService
      .create({
        name: this.name,
        suggestedBudget: this.suggestedBudget,
        eventDate: this.eventDate || null,
        place: this.place || null,
        notes: this.notes || null,
      })
      .subscribe({
        next: (room) => {
          this.loading.set(false);
          this.createdCode.set(room.code);
          this.createdRoomId = room.id;
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'No se pudo crear la sala');
        },
      });
  }

  goToRoom(): void {
    if (this.createdRoomId) {
      this.router.navigate(['/rooms', this.createdRoomId]);
    }
  }
}
