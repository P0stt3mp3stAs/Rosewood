// src/components/3D/audioManager.tsx

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private bellSoundBuffer: AudioBuffer | null = null;
  private isSoundLoaded = false;

  init() {
    if (this.audioContext) return;

    const AudioContextConstructor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    
    if (!AudioContextConstructor) return;

    this.audioContext = new AudioContextConstructor();

    fetch("/BellSound.mp3")
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        if (!this.audioContext) return;
        return this.audioContext.decodeAudioData(arrayBuffer);
      })
      .then((buffer) => {
        if (buffer) {
          this.bellSoundBuffer = buffer;
          this.isSoundLoaded = true;
        }
      })
      .catch((error) => {
        console.error("Error loading bell sound:", error);
      });
  }

  play() {
    if (!this.audioContext || !this.bellSoundBuffer || !this.isSoundLoaded) {
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = this.bellSoundBuffer;
    source.connect(this.audioContext.destination);
    source.playbackRate.value = 1.0;
    source.start(0);
  }
}