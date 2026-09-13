import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallPromptService } from '../../core/services/install-prompt.service';

@Component({
  selector: 'app-install-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './install-button.component.html',
  styleUrl: './install-button.component.css',
})
export class InstallButtonComponent {
  dismissed = signal(false);
  showIosHelp = signal(false);

  constructor(public installPrompt: InstallPromptService) {}

  shouldShow(): boolean {
    if (this.dismissed()) return false;
    if (this.installPrompt.isStandalone()) return false;
    return this.installPrompt.canPromptInstall() || this.installPrompt.isIos;
  }

  install(): void {
    if (this.installPrompt.isIos) {
      this.showIosHelp.set(true);
      return;
    }
    this.installPrompt.promptInstall();
  }
}
