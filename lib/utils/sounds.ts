class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  addToCart() {
    this.playTone(800, 0.1);
  }

  removeFromCart() {
    this.playTone(400, 0.15);
  }

  paymentSuccess() {
    this.playTone(600, 0.2);
    setTimeout(() => this.playTone(800, 0.2), 100);
  }

  paymentError() {
    this.playTone(300, 0.3);
  }

  scan() {
    this.playTone(1000, 0.05);
  }

  click() {
    this.playTone(500, 0.05);
  }
}

export const soundManager = new SoundManager();