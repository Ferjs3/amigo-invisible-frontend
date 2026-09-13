import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../../../core/services/question.service';
import { RoomService } from '../../../../core/services/room.service';
import { AskedQuestionResponse, QuestionResponse } from '../../../../core/models/models';

@Component({
  selector: 'app-questions-wall',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questions-wall.component.html',
  styleUrl: './questions-wall.component.css',
})
export class QuestionsWallComponent implements OnInit {
  @Input({ required: true }) roomId!: number;
  @Input({ required: true }) roomSealed = false;

  asked = signal<AskedQuestionResponse[]>([]);
  received = signal<QuestionResponse[]>([]);
  myTargetName = signal<string | null>(null);
  newQuestionText = '';
  asking = signal(false);
  askError = signal<string | null>(null);
  replyDrafts: Record<number, string> = {};

  constructor(
    private questionService: QuestionService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadAsked();
    this.loadReceived();
    if (this.roomSealed) {
      this.roomService.myAssignment(this.roomId).subscribe({
        next: (a) => this.myTargetName.set(a.receiverUsername),
        error: () => this.myTargetName.set(null),
      });
    }
  }

  loadAsked(): void {
    this.questionService.getAskedByMe(this.roomId).subscribe((qs) => this.asked.set(qs));
  }

  loadReceived(): void {
    this.questionService.getReceivedByMe(this.roomId).subscribe((qs) => this.received.set(qs));
  }

  ask(): void {
    if (!this.newQuestionText.trim()) return;
    this.asking.set(true);
    this.askError.set(null);

    this.questionService.ask(this.roomId, this.newQuestionText.trim()).subscribe({
      next: () => {
        this.newQuestionText = '';
        this.asking.set(false);
        this.loadAsked();
      },
      error: (err) => {
        this.asking.set(false);
        this.askError.set(err.error?.message ?? 'No se pudo enviar la pregunta');
      },
    });
  }

  answer(questionId: number): void {
    const draft = this.replyDrafts[questionId];
    if (!draft?.trim()) return;
    this.questionService.answer(questionId, draft.trim()).subscribe(() => {
      delete this.replyDrafts[questionId];
      this.loadReceived();
    });
  }
}
