export interface UserResponse {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export type RoomStatus = 'OPEN' | 'SEALED' | 'DISCARDED';
export type ParticipantStatus = 'PENDING' | 'READY';

export interface RoomSummary {
  id: number;
  name: string;
  code: string;
  status: RoomStatus;
  eventDate: string | null;
  isAdmin: boolean;
  participantCount: number;
}

export interface RoomPreview {
  name: string;
  adminUsername: string;
  eventDate: string | null;
  suggestedBudget: number | null;
  participantCount: number;
  canJoin: boolean;
}

export interface ParticipantResponse {
  userId: number;
  username: string;
  status: ParticipantStatus;
  isMe: boolean;
}

export interface RoomDetail {
  id: number;
  name: string;
  code: string;
  status: RoomStatus;
  suggestedBudget: number | null;
  eventDate: string | null;
  place: string | null;
  notes: string | null;
  isAdmin: boolean;
  participants: ParticipantResponse[];
}

export interface ExclusionResponse {
  id: number;
  giverId: number;
  giverUsername: string;
  receiverId: number;
  receiverUsername: string;
}

export interface MyAssignment {
  receiverId: number;
  receiverUsername: string;
}

export interface WishlistItem {
  id: number;
  userId: number;
  username: string;
  title: string;
  note: string | null;
  url: string | null;
  updatedAt: string;
}

export interface QuestionResponse {
  id: number;
  questionText: string;
  answerText: string | null;
  answered: boolean;
  createdAt: string;
}
