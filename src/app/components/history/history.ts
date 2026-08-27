import { Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './history.html',
  styleUrls: ['./history.scss'],
})
export class HistoryComponent {}
