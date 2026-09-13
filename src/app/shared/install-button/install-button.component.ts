import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallPromptService } from '../../core/services/install-prompt.service';

@Component({
  selector: 'app-install-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldShow()) {
      <div class="fixed bottom-0 left-0 right-0 z-40 bg-primary text-surface px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.25)]">
        <span class="text-xs">📲 Instalá la app para acceder más rápido</span>
        <div class="flex items-center gap-2 shrink-0">
          <button
            (click)="install()"
            class="bg-accent text-canvas text-xs font-semibold rounded-lg px-3 py-1.5"
          >
            Instalar
          </button>
          <button (click)="dismissed.set(true)" class="text-surface/60 text-sm px-1" aria-label="Cerrar">✕</button>
        </div>
      </div>
    }

    @if (showIosHelp()) {
      <div
        class="fixed inset-0 bg-canvas/80 flex items-end sm:items-center justify-center z-50 px-4"
        (click)="showIosHelp.set(false)"
      >
        <div class="bg-surface rounded-2xl p-6 max-w-sm w-full" (click)="$event.stopPropagation()">
          <h2 class="font-display text-lg text-fg mb-3">Para instalarla en iPhone</h2>
          <ol class="text-sm text-fg-muted list-decimal pl-5 flex flex-col gap-2">
            <li>Tocá el ícono de <strong>Compartir</strong> (el cuadrado con la flecha hacia arriba) en Safari.</li>
            <li>Elegí <strong>"Agregar a inicio"</strong>.</li>
            <li>Confirmá tocando <strong>"Agregar"</strong>.</li>
          </ol>
          <button
            (click)="showIosHelp.set(false)"
            class="mt-5 w-full border border-primary/30 text-primary rounded-lg py-2.5 text-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    }
  `,
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
