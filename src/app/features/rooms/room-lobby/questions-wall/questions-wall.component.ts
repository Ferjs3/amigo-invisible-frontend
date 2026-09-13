import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../../../core/services/question.service';
import { AskedQuestionResponse, ParticipantResponse, QuestionResponse } from '../../../../core/models/models';

@Component({
  selector: 'app-questions-wall',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2 class="font-display text-lg text-ink mb-1">Preguntas anónimas</h2>
    <p class="text-xs text-ink-soft mb-4">
      Todo acá es privado: solo vos ves lo que preguntaste, y solo vos ves lo que te preguntaron.
      Nadie más tiene acceso a esto.
    </p>

    <!-- Hacer una pregunta -->
    <div class="bg-paper-dim rounded-lg px-3.5 py-3 mb-5">
      <p class="text-xs text-ink-soft mb-2">Preguntale algo a alguien de la sala, sin firmar:</p>
      <div class="flex flex-col gap-2 sm:flex-row">
        <select
          [(ngModel)]="targetUserId"
          class="text-sm px-2.5 py-2 rounded-lg border border-plum/20 bg-white text-ink sm:w-40"
        >
          <option [ngValue]="null">Elegí a quién</option>
          @for (p of otherParticipants(); track p.userId) {
            <option [ngValue]="p.userId">{{ p.username }}</option>
          }
        </select>
        <input
          class="flex-1 text-sm px-2.5 py-2 rounded-lg border border-plum/20 bg-white text-ink"
          type="text"
          [(ngModel)]="newQuestionText"
          name="newQuestion"
          placeholder="Ej: ¿Talle de remera?"
        />
        <button
          (click)="ask()"
          [disabled]="!targetUserId || !newQuestionText.trim() || asking()"
          class="bg-coral disabled:opacity-40 text-white rounded-lg px-4 text-sm shrink-0"
        >
          Enviar
        </button>
      </div>
      @if (askError()) {
        <p class="text-xs text-coral-dark mt-2">{{ askError() }}</p>
      }
    </div>

    <!-- Lo que me preguntaron -->
    <h3 class="text-sm font-semibold text-ink mb-2">Me preguntaron</h3>
    <div class="flex flex-col gap-2.5 mb-5 max-h-64 overflow-y-auto pr-1">
      @for (q of received(); track q.id) {
        <div class="bg-paper-dim rounded-lg px-3.5 py-3">
          <p class="text-sm text-ink italic">&ldquo;{{ q.questionText }}&rdquo;</p>
          @if (q.answered) {
            <p class="text-sm text-pine-dark mt-1.5">→ {{ q.answerText }}</p>
          } @else {
            <div class="flex gap-2 mt-2">
              <input
                class="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-plum/20 bg-white text-ink"
                type="text"
                [(ngModel)]="replyDrafts[q.id]"
                [name]="'reply-' + q.id"
                placeholder="Responder (sin saber quién preguntó)"
              />
              <button (click)="answer(q.id)" class="bg-pine text-paper rounded-lg px-3 text-sm shrink-0">
                Enviar
              </button>
            </div>
          }
        </div>
      }
      @if (received().length === 0) {
        <p class="text-xs text-ink-soft italic">Todavía no te preguntaron nada.</p>
      }
    </div>

    <!-- Lo que pregunté -->
    <h3 class="text-sm font-semibold text-ink mb-2">Pregunté</h3>
    <div class="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
      @for (q of asked(); track q.id) {
        <div class="bg-paper-dim rounded-lg px-3.5 py-3">
          <p class="text-xs text-ink-soft mb-1">A {{ q.targetUsername }}</p>
          <p class="text-sm text-ink italic">&ldquo;{{ q.questionText }}&rdquo;</p>
          @if (q.answered) {
            <p class="text-sm text-pine-dark mt-1.5">→ {{ q.answerText }}</p>
          } @else {
            <p class="text-xs text-ink-soft italic mt-1.5">Sin responder todavía</p>
          }
        </div>
      }
      @if (asked().length === 0) {
        <p class="text-xs text-ink-soft italic">Todavía no le preguntaste nada a nadie.</p>
      }
    </div>
  `,
})
export class QuestionsWallComponent implements OnInit {
  @Input({ required: true }) roomId!: number;
  @Input({ required: true }) participants: ParticipantResponse[] = [];
  @Input({ required: true }) currentUserId!: number;

  asked = signal<AskedQuestionResponse[]>([]);
  received = signal<QuestionResponse[]>([]);
  targetUserId: number | null = null;
  newQuestionText = '';
  asking = signal(false);
  askError = signal<string | null>(null);
  replyDrafts: Record<number, string> = {};

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.loadAsked();
    this.loadReceived();
  }

  otherParticipants(): ParticipantResponse[] {
    return this.participants.filter((p) => p.userId !== this.currentUserId);
  }

  loadAsked(): void {
    this.questionService.getAskedByMe(this.roomId).subscribe((qs) => this.asked.set(qs));
  }

  loadReceived(): void {
    this.questionService.getReceivedByMe(this.roomId).subscribe((qs) => this.received.set(qs));
  }

  ask(): void {
    if (!this.targetUserId || !this.newQuestionText.trim()) return;
    this.asking.set(true);
    this.askError.set(null);

    this.questionService.ask(this.roomId, this.targetUserId, this.newQuestionText.trim()).subscribe({
      next: () => {
        this.newQuestionText = '';
        this.targetUserId = null;
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
