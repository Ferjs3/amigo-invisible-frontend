import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantResponse } from '../../../../core/models/models';

@Component({
  selector: 'app-participants-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participants-list.component.html',
  styleUrl: './participants-list.component.css',
})
export class ParticipantsListComponent {
  @Input({ required: true }) participants: ParticipantResponse[] = [];
  @Input() isAdmin = false;
  @Input() roomOpen = true;

  @Output() draw = new EventEmitter<void>();
  @Output() toggleReady = new EventEmitter<boolean>();
  @Output() removeParticipant = new EventEmitter<number>();
  @Output() leave = new EventEmitter<void>();

  readyCount(): number {
    return this.participants.filter((p) => p.status === 'READY').length;
  }

  canDraw(): boolean {
    return this.participants.length >= 3 && this.participants.every((p) => p.status === 'READY');
  }
}
