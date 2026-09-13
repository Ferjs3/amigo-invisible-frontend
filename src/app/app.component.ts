import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InstallButtonComponent } from './shared/install-button/install-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, InstallButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
