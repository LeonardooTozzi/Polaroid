import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './cta.html',
  styleUrls: ['./cta.scss'],
})
export class CtaComponent {}
