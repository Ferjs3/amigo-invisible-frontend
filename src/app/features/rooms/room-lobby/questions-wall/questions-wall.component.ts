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
  template: `
    <h2 class="font-display text-lg text-fg mb-1">Preguntas anónimas</h2>
    <p class="text-xs text-fg-muted mb-4">
      Todo acá es privado: solo vos ves lo que preguntaste, y solo vos ves lo que te preguntaron.
    </p>

    <!-- Hacer una pregunta: siempre a tu amigo invisible asignado, nunca a elegir -->
    <div class="bg-surface-dim rounded-lg px-3.5 py-3 mb-5">
      @if (!roomSealed) {
        <p class="text-xs text-fg-muted italic">
          Vas a poder preguntarle algo a tu amigo invisible una vez que se haga el sorteo.
        </p>
      } @else if (myTargetName()) {
        <p class="text-xs text-fg-muted mb-2">Preguntale algo a tu amigo invisible, sin firmar:</p>
        <div class="flex gap-2">
          <input
            class="flex-1 text-sm px-2.5 py-2 rounded-lg border border-primary/20 bg-white text-fg"
            type="text"
            [(ngModel)]="newQuestionText"
            name="newQuestion"
            placeholder="Ej: ¿Talle de remera?"
          />
          <button
            (click)="ask()"
            [disabled]="!newQuestionText.trim() || asking()"
            class="bg-danger disabled:opacity-40 text-white rounded-lg px-4 text-sm shrink-0"
          >
            Enviar
          </button>
        </div>
        @if (askError()) {
          <p class="text-xs text-danger-dark mt-2">{{ askError() }}</p>
        }
      } @else {
        <p class="text-xs text-fg-muted italic">Cargando tu asignación…</p>
      }
    </div>

    <!-- Lo que me preguntaron -->
    <h3 class="text-sm font-semibold text-fg mb-2">Me preguntaron</h3>
    <div class="flex flex-col gap-2.5 mb-5 max-h-64 overflow-y-auto pr-1">
      @for (q of received(); track q.id) {
        <div class="bg-surface-dim rounded-lg px-3.5 py-3">
          <p class="text-sm text-fg italic">&ldquo;{{ q.questionText }}&rdquo;</p>
          @if (q.answered) {
            <p class="text-sm text-success-dark mt-1.5">→ {{ q.answerText }}</p>
          } @else {
            <div class="flex gap-2 mt-2">
              <input
                class="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-primary/20 bg-white text-fg"
                type="text"
                [(ngModel)]="replyDrafts[q.id]"
                [name]="'reply-' + q.id"
                placeholder="Responder (sin saber quién preguntó)"
              />
              <button (click)="answer(q.id)" class="bg-success text-surface rounded-lg px-3 text-sm shrink-0">
                Enviar
              </button>
            </div>
          }
        </div>
      }
      @if (received().length === 0) {
        <p class="text-xs text-fg-muted italic">Todavía no te preguntaron nada.</p>
      }
    </div>

    <!-- Lo que pregunté -->
    <h3 class="text-sm font-semibold text-fg mb-2">Pregunté</h3>
    <div class="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
      @for (q of asked(); track q.id) {
        <div class="bg-surface-dim rounded-lg px-3.5 py-3">
          <p class="text-xs text-fg-muted mb-1">A {{ q.targetUsername }}</p>
          <p class="text-sm text-fg italic">&ldquo;{{ q.questionText }}&rdquo;</p>
          @if (q.answered) {
            <p class="text-sm text-success-dark mt-1.5">→ {{ q.answerText }}</p>
          } @else {
            <p class="text-xs text-fg-muted italic mt-1.5">Sin responder todavía</p>
          }
        </div>
      }
      @if (asked().length === 0) {
        <p class="text-xs text-fg-muted italic">Todavía no le preguntaste nada a nadie.</p>
      }
    </div>
  `,
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
