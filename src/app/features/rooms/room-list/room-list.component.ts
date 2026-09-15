import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoomSummary } from '../../../core/models/models';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css',
})
export class RoomListComponent implements OnInit {
  rooms = signal<RoomSummary[]>([]);
  loading = signal(true);

  constructor(private roomService: RoomService, public authService: AuthService) {}

  ngOnInit(): void {
    this.roomService.myRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(status: string): string {
    if (status === 'OPEN') return 'Abierta';
    if (status === 'SEALED') return 'Sellada';
    return 'Descartada';
  }

  statusClass(status: string): string {
    if (status === 'OPEN') return 'tag tag--success';
    if (status === 'SEALED') return 'tag tag--primary';
    return 'tag tag--danger';
  }
}
