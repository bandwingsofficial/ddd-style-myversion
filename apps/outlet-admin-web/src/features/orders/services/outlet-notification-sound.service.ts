const SOUND_URL = '/sounds/alert-sound.mp3';
const REPEAT_DELAY_MS = 10_000;

class OutletNotificationSoundService {
  private audio: HTMLAudioElement | null = null;
  private repeatTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private unlocked = false;
  private pendingCount = 0;
  private isPlaying = false;
  private endedHandler: (() => void) | null = null;
  private unlockListenersAttached = false;

  preload(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (!this.audio) {
      this.audio = new Audio(SOUND_URL);
      this.audio.preload = 'auto';
    }
  }

  attachUnlockListeners(): void {
    if (typeof window === 'undefined' || this.unlockListenersAttached) {
      return;
    }

    this.unlockListenersAttached = true;

    const unlock = () => {
      this.unlock();
    };

    document.addEventListener('pointerdown', unlock, { once: true, passive: true });
    document.addEventListener('keydown', unlock, { once: true });
  }

  unlock(): void {
    if (this.unlocked) {
      return;
    }

    this.unlocked = true;

    if (this.running && this.pendingCount > 0 && !this.isPlaying) {
      this.scheduleNextPlay(0);
    }
  }

  hasPendingOrders(): boolean {
    return this.pendingCount > 0;
  }

  syncPendingCount(count: number): void {
    this.pendingCount = count;

    if (count > 0) {
      this.start();
      return;
    }

    this.stop();
  }

  start(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.preload();

    const wasRunning = this.running;
    this.running = true;

    if (!wasRunning && this.unlocked && this.pendingCount > 0 && !this.isPlaying) {
      this.scheduleNextPlay(0);
    }
  }

  stop(): void {
    this.running = false;

    if (this.repeatTimeoutId !== null) {
      clearTimeout(this.repeatTimeoutId);
      this.repeatTimeoutId = null;
    }

    if (this.audio && this.endedHandler) {
      this.audio.removeEventListener('ended', this.endedHandler);
      this.endedHandler = null;
    }

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    this.isPlaying = false;
  }

  play(): void {
    if (!this.unlocked || this.pendingCount <= 0) {
      return;
    }

    void this.playOnce();
  }

  private scheduleNextPlay(delayMs: number): void {
    if (!this.running || this.pendingCount <= 0 || !this.unlocked) {
      return;
    }

    if (this.repeatTimeoutId !== null) {
      clearTimeout(this.repeatTimeoutId);
    }

    this.repeatTimeoutId = setTimeout(() => {
      this.repeatTimeoutId = null;

      if (!this.running || this.pendingCount <= 0 || !this.unlocked) {
        return;
      }

      void this.playOnce();
    }, delayMs);
  }

  private async playOnce(): Promise<void> {
    if (
      !this.running ||
      this.pendingCount <= 0 ||
      !this.unlocked ||
      this.isPlaying
    ) {
      return;
    }

    this.preload();

    if (!this.audio) {
      return;
    }

    if (this.endedHandler) {
      this.audio.removeEventListener('ended', this.endedHandler);
      this.endedHandler = null;
    }

    this.isPlaying = true;

    try {
      this.audio.currentTime = 0;
      await this.audio.play();
    } catch {
      this.isPlaying = false;
      return;
    }

    this.endedHandler = () => {
      this.isPlaying = false;

      if (this.audio && this.endedHandler) {
        this.audio.removeEventListener('ended', this.endedHandler);
      }

      this.endedHandler = null;

      if (this.running && this.pendingCount > 0) {
        this.scheduleNextPlay(REPEAT_DELAY_MS);
      }
    };

    this.audio.addEventListener('ended', this.endedHandler);
  }
}

export const outletNotificationSoundService =
  new OutletNotificationSoundService();
