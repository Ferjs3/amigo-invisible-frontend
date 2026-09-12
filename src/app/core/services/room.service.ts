import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RoomSummary,
  RoomPreview,
  RoomDetail,
  ExclusionResponse,
  MyAssignment,
} from '../models/models';

export interface CreateRoomPayload {
  name: string;
  suggestedBudget?: number | null;
  eventDate?: string | null;
  place?: string | null;
  notes?: string | null;
}

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly baseUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) {}

  create(payload: CreateRoomPayload): Observable<RoomDetail> {
    return this.http.post<RoomDetail>(this.baseUrl, payload);
  }

  myRooms(): Observable<RoomSummary[]> {
    return this.http.get<RoomSummary[]>(this.baseUrl);
  }

  preview(code: string): Observable<RoomPreview> {
    return this.http.get<RoomPreview>(`${this.baseUrl}/${code}/preview`);
  }

  join(code: string): Observable<RoomDetail> {
    return this.http.post<RoomDetail>(`${this.baseUrl}/${code}/join`, {});
  }

  getDetail(roomId: number): Observable<RoomDetail> {
    return this.http.get<RoomDetail>(`${this.baseUrl}/${roomId}`);
  }

  setReady(roomId: number, ready: boolean): Observable<RoomDetail> {
    return this.http.patch<RoomDetail>(`${this.baseUrl}/${roomId}/participants/me`, { ready });
  }

  leave(roomId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${roomId}/participants/me`);
  }

  removeParticipant(roomId: number, userId: number): Observable<RoomDetail> {
    return this.http.delete<RoomDetail>(`${this.baseUrl}/${roomId}/participants/${userId}`);
  }

  listExclusions(roomId: number): Observable<ExclusionResponse[]> {
    return this.http.get<ExclusionResponse[]>(`${this.baseUrl}/${roomId}/exclusions`);
  }

  addExclusion(roomId: number, giverId: number, receiverId: number): Observable<ExclusionResponse> {
    return this.http.post<ExclusionResponse>(`${this.baseUrl}/${roomId}/exclusions`, { giverId, receiverId });
  }

  removeExclusion(roomId: number, exclusionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${roomId}/exclusions/${exclusionId}`);
  }

  draw(roomId: number): Observable<RoomDetail> {
    return this.http.post<RoomDetail>(`${this.baseUrl}/${roomId}/draw`, {});
  }

  myAssignment(roomId: number): Observable<MyAssignment> {
    return this.http.get<MyAssignment>(`${this.baseUrl}/${roomId}/my-assignment`);
  }
}
