import { Component } from '@angular/core';
import { CalComponent } from './components/cal/cal.component';

@Component({
  selector: 'app-root',
  imports: [ CalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'korfbalcal';
}
