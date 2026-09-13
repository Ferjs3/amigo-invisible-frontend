import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../../../core/services/room.service';

@Component({
  selector: 'app-secret-friend-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './secret-friend-card.component.html',
  styleUrl: './secret-friend-card.component.css',
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
