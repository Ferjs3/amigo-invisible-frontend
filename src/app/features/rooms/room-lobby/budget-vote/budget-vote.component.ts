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
  templateUrl: './budget-vote.component.html',
  styleUrl: './budget-vote.component.css',
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
