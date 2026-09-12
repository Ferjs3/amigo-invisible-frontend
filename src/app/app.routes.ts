import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'rooms' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'rooms',
    canActivate: [authGuard],
    loadComponent: () => import('./features/rooms/room-list/room-list.component').then((m) => m.RoomListComponent),
  },
  {
    path: 'rooms/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/rooms/room-create/room-create.component').then((m) => m.RoomCreateComponent),
  },
  {
    path: 'rooms/join',
    canActivate: [authGuard],
    loadComponent: () => import('./features/rooms/room-join/room-join.component').then((m) => m.RoomJoinComponent),
  },
  {
    path: 'rooms/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/rooms/room-lobby/room-lobby.component').then((m) => m.RoomLobbyComponent),
  },
  { path: '**', redirectTo: 'rooms' },
];
