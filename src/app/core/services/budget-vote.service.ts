import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BudgetVoteStatus } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BudgetVoteService {
  constructor(private http: HttpClient) {}

  private base(roomId: number): string {
    return `${environment.apiUrl}/rooms/${roomId}/budget-vote`;
  }

  getStatus(roomId: number): Observable<BudgetVoteStatus> {
    return this.http.get<BudgetVoteStatus>(this.base(roomId));
  }

  open(roomId: number): Observable<BudgetVoteStatus> {
    return this.http.post<BudgetVoteStatus>(`${this.base(roomId)}/open`, {});
  }

  castVote(roomId: number, amount: number): Observable<BudgetVoteStatus> {
    return this.http.post<BudgetVoteStatus>(this.base(roomId), { amount });
  }

  resolveTie(roomId: number, amount: number): Observable<BudgetVoteStatus> {
    return this.http.post<BudgetVoteStatus>(`${this.base(roomId)}/resolve-tie`, { amount });
  }
}
