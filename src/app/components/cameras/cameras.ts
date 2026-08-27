import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-cameras',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './cameras.html',
  styleUrls: ['./cameras.scss'],
})
export class CamerasComponent {}
