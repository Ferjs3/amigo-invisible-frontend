import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuestionResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor(private http: HttpClient) {}

  getWall(roomId: number, targetUserId: number): Observable<QuestionResponse[]> {
    return this.http.get<QuestionResponse[]>(`${environment.apiUrl}/rooms/${roomId}/questions/${targetUserId}`);
  }

  ask(roomId: number, targetUserId: number, questionText: string): Observable<QuestionResponse> {
    return this.http.post<QuestionResponse>(`${environment.apiUrl}/rooms/${roomId}/questions/${targetUserId}`, {
      questionText,
    });
  }

  answer(questionId: number, answerText: string): Observable<QuestionResponse> {
    return this.http.patch<QuestionResponse>(`${environment.apiUrl}/questions/${questionId}/answer`, {
      answerText,
    });
  }
}
