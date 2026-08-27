import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero';
import { SpectrumComponent } from './components/spectrum/spectrum';
import { MagicComponent } from './components/magic/magic';
import { HistoryComponent } from './components/history/history';
import { GalleryComponent } from './components/gallery/gallery';
import { CultureComponent } from './components/culture/culture';
import { CamerasComponent } from './components/cameras/cameras';
import { CtaComponent } from './components/cta/cta';

@Component({
  imports: [
    HeroComponent,
    SpectrumComponent,
    MagicComponent,
    HistoryComponent,
    GalleryComponent,
    CultureComponent,
    CamerasComponent,
    CtaComponent,
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
