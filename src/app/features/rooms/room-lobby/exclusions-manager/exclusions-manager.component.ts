import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../../core/services/room.service';
import { ExclusionResponse, ParticipantResponse } from '../../../../core/models/models';

@Component({
  selector: 'app-exclusions-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2 class="font-display text-lg text-fg mb-1">Restricciones</h2>
    <p class="text-xs text-fg-muted mb-4">
      Definí quién no puede regalarle a quién antes de sortear.
    </p>

    <div class="flex flex-col gap-2 mb-4">
      @for (ex of exclusions(); track ex.id) {
        <div class="flex items-center justify-between bg-surface-dim rounded-lg px-3.5 py-2.5 text-sm text-fg">
          <span>{{ ex.giverUsername }} no le regala a {{ ex.receiverUsername }}</span>
          <button (click)="remove(ex.id)" class="text-danger-dark text-xs">Quitar</button>
        </div>
      }
      @if (exclusions().length === 0) {
        <p class="text-xs text-fg-muted italic">Todavía no hay restricciones cargadas.</p>
      }
    </div>

    <div class="flex gap-2">
      <select
        [(ngModel)]="giverId"
        class="flex-1 text-sm px-2.5 py-2 rounded-lg border border-primary/20 bg-white text-fg"
      >
        <option [ngValue]="null">No puede regalarle...</option>
        @for (p of participants; track p.userId) {
          <option [ngValue]="p.userId">{{ p.username }}</option>
        }
      </select>
      <select
        [(ngModel)]="receiverId"
        class="flex-1 text-sm px-2.5 py-2 rounded-lg border border-primary/20 bg-white text-fg"
      >
        <option [ngValue]="null">...a esta persona</option>
        @for (p of participants; track p.userId) {
          <option [ngValue]="p.userId">{{ p.username }}</option>
        }
      </select>
      <button
        (click)="add()"
        [disabled]="!giverId || !receiverId || giverId === receiverId"
        class="bg-primary disabled:opacity-40 text-surface rounded-lg px-3 text-sm"
      >
        Agregar
      </button>
    </div>
  `,
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
