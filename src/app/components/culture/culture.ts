import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-culture',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './culture.html',
  styleUrls: ['./culture.scss'],
})
export class CultureComponent {}
