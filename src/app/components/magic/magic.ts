import {
  Component,
  PLATFORM_ID,
  Inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  viewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createTimeline, stagger } from 'animejs';
import { RevealDirective } from '../../directives/reveal.directive';

type Phase = 'idle' | 'capture' | 'darkroom' | 'revealed';

type FilmSettings = {
  exposure: number;
  contrast: number;
  saturation: number;
  warmth: number;
  grain: number;
  vignette: number;
  blur: number;
  redShift: number;
  blueShift: number;
};

function randomFilmSettings(): FilmSettings {
  return {
    exposure: Math.random() * 30 - 15,
    contrast: Math.random() * 30 + 85,
    saturation: Math.random() * 35 + 85,
    warmth: Math.random() * 20 - 10,
    grain: Math.random() * 25 + 5,
    vignette: Math.random() * 0.35 + 0.15,
    blur: Math.random() * 0.8,
    redShift: Math.random() * 6 - 3,
    blueShift: Math.random() * 6 - 3,
  };
}

function applyFilmFilter(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const settings = randomFilmSettings();

  ctx.filter = `
    blur(${settings.blur}px)
    brightness(${100 + settings.exposure}%)
    contrast(${settings.contrast}%)
    saturate(${settings.saturation}%)
  `;

  ctx.drawImage(image, 0, 0);

  ctx.filter = 'none';

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];

    r += settings.warmth;
    b -= settings.warmth;

    r += settings.redShift;
    b += settings.blueShift;

    const noise = (Math.random() - 0.5) * settings.grain;

    r += noise;
    g += noise;
    b += noise;

    pixels[i] = clamp(r);
    pixels[i + 1] = clamp(g);
    pixels[i + 2] = clamp(b);
  }

  ctx.putImageData(imageData, 0, 0);

  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    Math.min(canvas.width, canvas.height) * 0.2,
    canvas.width / 2,
    canvas.height / 2,
    Math.max(canvas.width, canvas.height) * 0.7
  );

  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(0,0,0,${settings.vignette})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

@Component({
  selector: 'app-magic',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './magic.html',
  styleUrls: ['./magic.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MagicComponent implements OnDestroy {
  private readonly isBrowser: boolean;
  private stream?: MediaStream;
  private revealTimeline?: ReturnType<typeof createTimeline>;

  readonly phase = signal<Phase>('idle');
  readonly photos = signal<string[]>([]);
  readonly developed = signal<string[]>([]);
  readonly cameraOn = signal(false);
  readonly lit = signal(false);
  readonly pulled = signal(false);
  readonly revealing = signal(false);
  readonly processing = signal(false);
  readonly pulling = signal(false);
  readonly error = signal('');

  readonly photoCount = computed(() => this.photos().length);
  readonly canEnterDarkroom = computed(() => this.photos().length === 3);
  readonly indexLabel = computed(() => `${this.photos().length} / 3`);
  readonly emptySlots = computed(() =>
    Array.from({ length: Math.max(0, 3 - this.photos().length) })
  );

  readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('video');
  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnDestroy(): void {
    this.stopAmbientGlow();
    this.stopCamera();
    this.revealTimeline?.revert();
  }

  async startCamera(): Promise<void> {
    if (!this.isBrowser) return;
    this.error.set('');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      const video = this.videoRef()?.nativeElement;
      if (video) {
        video.srcObject = this.stream;
        await video.play();
      }
      this.cameraOn.set(true);
      this.phase.set('capture');
    } catch {
      this.error.set(
        'Não foi possível acessar a câmera. Você pode enviar fotos do dispositivo.'
      );
    }
  }

  capture(): void {
    if (!this.isBrowser || this.photoCount() >= 3) return;
    const video = this.videoRef()?.nativeElement;
    const canvas = this.canvasRef()?.nativeElement;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    this.photos.update((p) => (p.length < 3 ? [...p, dataUrl] : p));
  }

  onFileSelected(event: Event): void {
    if (!this.isBrowser) return;
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;
    const remaining = 3 - this.photos().length;
    const toRead = Array.from(files).slice(0, remaining);
    if (toRead.length === 0) {
      input.value = '';
      return;
    }
    this.phase.set('capture');
    for (const file of toRead) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        this.photos.update((p) => (p.length < 3 ? [...p, dataUrl] : p));
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  openFilePicker(): void {
    this.fileInputRef()?.nativeElement?.click();
  }

  enterDarkroom(): void {
    if (!this.canEnterDarkroom()) return;
    this.stopCamera();
    this.lockScroll();
    this.phase.set('darkroom');
    this.lit.set(true);
    this.startAmbientGlow();
    this.processing.set(true);
    this.developPhotos().finally(() => this.processing.set(false));
  }

  private async developPhotos(): Promise<void> {
    if (!this.isBrowser) return;
    const developed = await Promise.all(
      this.photos().map((src) => this.developPhoto(src))
    );
    this.developed.set(developed);
  }

  private developPhoto(src: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          if (img.decode) {
            await img.decode();
          }
          const canvas = document.createElement('canvas');
          applyFilmFilter(img, canvas);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } catch {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  }

  pull(): void {
    if (!this.isBrowser || this.revealing() || this.pulled() || this.processing()) return;
    this.pulled.set(true);
    this.stopAmbientGlow();
    this.reveal();
  }

  onCordClick(): void {
    if (this.revealing() || this.pulled() || this.processing() || this.pulling()) return;
    this.pulling.set(true);
    setTimeout(() => this.pull(), 225);
    setTimeout(() => this.pulling.set(false), 450);
  }

  onCordKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (this.revealing() || this.processing() || this.pulled()) return;
    event.preventDefault();
    this.onCordClick();
  }

  private reveal(): void {
    if (!this.isBrowser) return;
    this.revealing.set(true);

    if (this.reducedMotion()) {
      const photos = this.queryPhotos();
      photos.forEach((p) => p.classList.add('revealed'));
      this.finishReveal();
      return;
    }

    this.revealTimeline?.revert();
    this.revealTimeline = createTimeline({
      defaults: { ease: 'inOutQuad' },
    });

    this.revealTimeline
      .add('.darkroom-photo .red-overlay', {
        opacity: [0.55, 0],
        duration: 1200,
        delay: stagger(340),
        ease: 'outSine',
      })
      .add(
        '.darkroom-photo',
        {
          opacity: [0.22, 1],
          scale: [0.94, 1],
          duration: 1100,
          delay: stagger(340),
        },
        '<'
      );

    this.photos().forEach((_, i) => {
      this.revealTimeline?.call(
        () => this.queryPhotos()[i]?.classList.add('revealed'),
        i * 340 + 180
      );
    });

    this.revealTimeline.call(() => this.finishReveal(), '+=500');
  }

  private finishReveal(): void {
    this.revealing.set(false);
    this.pulled.set(false);
    this.lit.set(false);
    this.unlockScroll();
    this.phase.set('revealed');
  }

  downloadPhoto(index: number, event: Event): void {
    if (!this.isBrowser) return;
    const src = this.developed()[index] || this.photos()[index];
    if (!src) return;

    event.preventDefault();
    const link = document.createElement('a');
    link.href = src;
    link.download = `polaroid-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  reset(): void {
    this.stopCamera();
    this.stopAmbientGlow();
    this.revealTimeline?.revert();
    this.unlockScroll();
    this.queryPhotos().forEach((p) => p.classList.remove('revealed'));
    this.photos.set([]);
    this.developed.set([]);
    this.lit.set(false);
    this.pulled.set(false);
    this.pulling.set(false);
    this.revealing.set(false);
    this.error.set('');
    this.phase.set('idle');
  }

  private lockScroll(): void {
    if (!this.isBrowser) return;
    document.body.classList.add('darkroom-open');
  }

  private unlockScroll(): void {
    if (!this.isBrowser) return;
    document.body.classList.remove('darkroom-open');
  }

  private stopCamera(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = undefined;
    this.cameraOn.set(false);
  }

  private startAmbientGlow(): void {
    // The .lit class triggers CSS keyframe pulsing on the glow layers.
  }

  private stopAmbientGlow(): void {
    // CSS handles the glow pulse; no JS animation to stop.
  }

  private queryPhotos(): HTMLElement[] {
    if (!this.isBrowser) return [];
    return Array.from(document.querySelectorAll('.darkroom-photo'));
  }

  private reducedMotion(): boolean {
    return (
      this.isBrowser &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
