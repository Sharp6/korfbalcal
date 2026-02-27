import { Component } from '@angular/core';
import { CalComponent } from '../../components/cal/cal.component';

@Component({
  selector: 'app-cal-page',
  standalone: true,
  imports: [CalComponent],
  templateUrl: './cal-page.component.html',
  styleUrl: './cal-page.component.css'
})
export class CalPageComponent {}
