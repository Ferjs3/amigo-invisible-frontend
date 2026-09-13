import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval, switchMap } from 'rxjs';
import { BudgetVoteService } from '../../../../core/services/budget-vote.service';
import { BudgetVoteStatus } from '../../../../core/models/models';

const POLL_INTERVAL_MS = 5000;

@Component({
  selector: 'app-budget-vote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2 class="font-display text-lg text-fg mb-1">Presupuesto</h2>

    @if (status(); as s) {
      @if (!s.open) {
        <p class="text-xs text-fg-muted mb-3">
          Presupuesto actual: {{ s.currentBudget ? ('$' + s.currentBudget) : 'sin definir' }}
        </p>
        @if (isAdmin && roomOpen) {
          <button
            (click)="openVote()"
            [disabled]="loading()"
            class="bg-primary text-surface rounded-lg px-4 py-2 text-xs"
          >
            Abrir votación de presupuesto
          </button>
        }
      } @else if (s.tieVotePending) {
        @if (isAdmin) {
          <p class="text-xs text-fg-muted mb-3">
            Hay un empate entre estos montos. Elegí el definitivo (solo vos ves esta pantalla):
          </p>
          <div class="flex flex-wrap gap-2">
            @for (amount of s.tiedAmounts; track amount) {
              <button
                (click)="resolveTie(amount)"
                [disabled]="loading()"
                class="bg-accent text-canvas rounded-lg px-3.5 py-2 text-sm font-semibold"
              >
                &#36;{{ amount }}
              </button>
            }
          </div>
        } @else {
          <p class="text-xs text-fg-muted italic">
            Todos votaron y hubo un empate. El admin está eligiendo el monto final.
          </p>
        }
      } @else {
        <p class="text-xs text-fg-muted mb-3">
          {{ s.votedCount }} de {{ s.totalParticipants }} ya votaron. Tu voto es secreto, nadie ve qué elegiste.
        </p>
        <div class="flex gap-2">
          <select
            [(ngModel)]="selectedAmount"
            class="flex-1 text-sm px-2.5 py-2 rounded-lg border border-primary/20 bg-white text-fg"
          >
            <option [ngValue]="null">Elegí un monto</option>
            @for (opt of s.options; track opt) {
              <option [ngValue]="opt">&#36;{{ opt }}</option>
            }
          </select>
          <button
            (click)="vote()"
            [disabled]="!selectedAmount || loading()"
            class="bg-primary disabled:opacity-40 text-surface rounded-lg px-4 text-sm"
          >
            {{ s.myVote ? 'Cambiar voto' : 'Votar' }}
          </button>
        </div>
        @if (s.myVote) {
          <p class="text-xs text-success-dark mt-2">Ya votaste. Podés cambiarlo mientras falten votos.</p>
        }
      }
    }

    @if (error()) {
      <p class="text-xs text-danger-dark mt-2">{{ error() }}</p>
    }
  `,
})
export class BudgetVoteComponent implements OnInit, OnDestroy {
  @Input({ required: true }) roomId!: number;
  @Input() isAdmin = false;
  @Input() roomOpen = true;

  status = signal<BudgetVoteStatus | null>(null);
  selectedAmount: number | null = null;
  loading = signal(false);
  error = signal<string | null>(null);

  private pollSub?: Subscription;

  constructor(private budgetVoteService: BudgetVoteService) {}

  ngOnInit(): void {
    this.refresh();
    this.pollSub = interval(POLL_INTERVAL_MS)
      .pipe(switchMap(() => this.budgetVoteService.getStatus(this.roomId)))
      .subscribe({
        next: (s) => this.status.set(s),
        error: () => {},
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  refresh(): void {
    this.budgetVoteService.getStatus(this.roomId).subscribe((s) => this.status.set(s));
  }

  openVote(): void {
    this.loading.set(true);
    this.error.set(null);
    this.budgetVoteService.open(this.roomId).subscribe({
      next: (s) => {
        this.status.set(s);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo abrir la votación');
      },
    });
  }

  vote(): void {
    if (!this.selectedAmount) return;
    this.loading.set(true);
    this.error.set(null);
    this.budgetVoteService.castVote(this.roomId, this.selectedAmount).subscribe({
      next: (s) => {
        this.status.set(s);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo registrar tu voto');
      },
    });
  }

  resolveTie(amount: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.budgetVoteService.resolveTie(this.roomId, amount).subscribe({
      next: (s) => {
        this.status.set(s);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'No se pudo resolver el empate');
      },
    });
  }
}
