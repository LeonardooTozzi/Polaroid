import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.scss'],
})
export class GalleryComponent {}
