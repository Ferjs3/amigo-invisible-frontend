import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AskedQuestionResponse, QuestionResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor(private http: HttpClient) {}

  getAskedByMe(roomId: number): Observable<AskedQuestionResponse[]> {
    return this.http.get<AskedQuestionResponse[]>(`${environment.apiUrl}/rooms/${roomId}/questions/asked`);
  }

  getReceivedByMe(roomId: number): Observable<QuestionResponse[]> {
    return this.http.get<QuestionResponse[]>(`${environment.apiUrl}/rooms/${roomId}/questions/received`);
  }

  ask(roomId: number, questionText: string): Observable<AskedQuestionResponse> {
    return this.http.post<AskedQuestionResponse>(`${environment.apiUrl}/rooms/${roomId}/questions/ask`, {
      questionText,
    });
  }

  answer(questionId: number, answerText: string): Observable<QuestionResponse> {
    return this.http.patch<QuestionResponse>(`${environment.apiUrl}/questions/${questionId}/answer`, {
      answerText,
    });
  }
}
