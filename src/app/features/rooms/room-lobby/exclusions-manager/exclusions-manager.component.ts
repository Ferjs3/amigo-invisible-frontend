import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../../core/services/room.service';
import { ExclusionResponse, ParticipantResponse } from '../../../../core/models/models';

@Component({
  selector: 'app-exclusions-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exclusions-manager.component.html',
  styleUrl: './exclusions-manager.component.css',
})
export class ExclusionsManagerComponent implements OnInit {
  @Input({ required: true }) roomId!: number;
  @Input({ required: true }) participants: ParticipantResponse[] = [];

  exclusions = signal<ExclusionResponse[]>([]);
  giverId: number | null = null;
  receiverId: number | null = null;

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.roomService.listExclusions(this.roomId).subscribe((list) => this.exclusions.set(list));
  }

  add(): void {
    if (!this.giverId || !this.receiverId) return;
    this.roomService.addExclusion(this.roomId, this.giverId, this.receiverId).subscribe(() => {
      this.giverId = null;
      this.receiverId = null;
      this.load();
    });
  }

  remove(exclusionId: number): void {
    this.roomService.removeExclusion(this.roomId, exclusionId).subscribe(() => this.load());
  }
}
