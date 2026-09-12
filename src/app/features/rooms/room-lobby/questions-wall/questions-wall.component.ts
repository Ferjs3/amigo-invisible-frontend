import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../../../core/services/question.service';
import { ParticipantResponse, QuestionResponse } from '../../../../core/models/models';

@Component({
  selector: 'app-questions-wall',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2 class="font-display text-lg text-ink mb-1">Preguntas anónimas</h2>
    <p class="text-xs text-ink-soft mb-4">
      Elegí un muro para ver o dejar una pregunta. Quien responde no ve quién preguntó.
    </p>

    <div class="flex gap-2 flex-wrap mb-4">
      @for (p of participants; track p.userId) {
        <button
          (click)="selectWall(p.userId)"
          class="text-xs px-3 py-1.5 rounded-full"
          [ngClass]="selectedWallId === p.userId ? 'bg-plum text-paper' : 'bg-paper-dim text-ink'"
        >
          {{ p.username }}{{ p.isMe ? ' (vos)' : '' }}
        </button>
      }
    </div>

    <div class="flex flex-col gap-2.5 mb-4">
      @for (q of questions(); track q.id) {
        <div class="bg-paper-dim rounded-lg px-3.5 py-3">
          <p class="text-sm text-ink italic">&ldquo;{{ q.questionText }}&rdquo;</p>

          @if (q.answered) {
            <p class="text-sm text-pine-dark mt-1.5">→ {{ q.answerText }}</p>
          } @else if (isMyWall()) {
            <div class="flex gap-2 mt-2">
              <input
                class="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-plum/20 bg-white text-ink"
                type="text"
                [(ngModel)]="replyDrafts[q.id]"
                [name]="'reply-' + q.id"
                placeholder="Responder públicamente"
              />
              <button (click)="answer(q.id)" class="bg-pine text-paper rounded-lg px-3 text-sm">
                Enviar
              </button>
            </div>
          } @else {
            <p class="text-xs text-ink-soft italic mt-1.5">Sin responder todavía</p>
          }
        </div>
      }
      @if (questions().length === 0) {
        <p class="text-xs text-ink-soft italic">Todavía no hay preguntas en este muro.</p>
      }
    </div>

    @if (!isMyWall() && selectedWallId) {
      <div class="flex gap-2">
        <input
          class="flex-1 text-sm px-2.5 py-2 rounded-lg border border-plum/20 bg-paper-dim text-ink"
          type="text"
          [(ngModel)]="newQuestionText"
          name="newQuestion"
          placeholder="Preguntale algo sin firmar"
        />
        <button
          (click)="ask()"
          [disabled]="!newQuestionText.trim()"
          class="bg-coral disabled:opacity-40 text-white rounded-lg px-4 text-sm"
        >
          Enviar
        </button>
      </div>
    }
  `,
})
export class QuestionsWallComponent implements OnInit {
  @Input({ required: true }) roomId!: number;
  @Input({ required: true }) participants: ParticipantResponse[] = [];
  @Input({ required: true }) currentUserId!: number;

  selectedWallId: number | null = null;
  questions = signal<QuestionResponse[]>([]);
  newQuestionText = '';
  replyDrafts: Record<number, string> = {};

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    const other = this.participants.find((p) => !p.isMe);
    this.selectWall(other?.userId ?? this.participants[0]?.userId ?? null);
  }

  isMyWall(): boolean {
    return this.selectedWallId === this.currentUserId;
  }

  selectWall(userId: number | null): void {
    if (!userId) return;
    this.selectedWallId = userId;
    this.questionService.getWall(this.roomId, userId).subscribe((qs) => this.questions.set(qs));
  }

  ask(): void {
    if (!this.selectedWallId || !this.newQuestionText.trim()) return;
    this.questionService.ask(this.roomId, this.selectedWallId, this.newQuestionText.trim()).subscribe(() => {
      this.newQuestionText = '';
      this.selectWall(this.selectedWallId);
    });
  }

  answer(questionId: number): void {
    const draft = this.replyDrafts[questionId];
    if (!draft?.trim()) return;
    this.questionService.answer(questionId, draft.trim()).subscribe(() => {
      delete this.replyDrafts[questionId];
      this.selectWall(this.selectedWallId);
    });
  }
}
