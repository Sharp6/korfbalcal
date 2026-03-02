import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cal-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule],
  templateUrl: './cal-table.component.html',
  styleUrl: './cal-table.component.css'
})
export class CalTableComponent {
  @Input({ required: true }) games: any[] = [];
  @Input() displayedColumns: string[] = ['title', 'team', 'isHomeGame', 'date', 'time'];
}
