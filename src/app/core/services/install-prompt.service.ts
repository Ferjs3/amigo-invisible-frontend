import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InstallPromptService {
  private deferredPrompt: any = null;

  // Se pone en true cuando Chrome/Android nos avisa que la app SE PUEDE instalar.
  readonly canPromptInstall = signal(false);
  // Si ya esta corriendo instalada (abierta desde el icono), no tiene sentido ofrecer instalar de nuevo.
  readonly isStandalone = signal(this.detectStandalone());
  readonly isIos = this.detectIos();

  constructor() {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      // Sin este preventDefault, Chrome muestra su propio mini-infobar y despues
      // no nos deja disparar el prompt nosotros cuando querramos (por eso el
      // boton del navegador "a veces no aparece": depende de heuristicas de Chrome).
      event.preventDefault();
      this.deferredPrompt = event;
      this.canPromptInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canPromptInstall.set(false);
      this.isStandalone.set(true);
    });
  }

  async promptInstall(): Promise<void> {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canPromptInstall.set(false);
  }

  private detectStandalone(): boolean {
    const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    return displayModeStandalone || iosStandalone;
  }

  private detectIos(): boolean {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }
}
