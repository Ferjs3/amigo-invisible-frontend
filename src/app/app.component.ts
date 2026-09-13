import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InstallButtonComponent } from './shared/install-button/install-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, InstallButtonComponent],
  template: `
    <router-outlet></router-outlet>
    <app-install-button></app-install-button>
  `,
})
export class AppComponent {}
