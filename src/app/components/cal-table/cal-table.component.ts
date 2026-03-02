import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-cal-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatCheckboxModule],
  templateUrl: './cal-table.component.html',
  styleUrl: './cal-table.component.css'
})
export class CalTableComponent {
  @Input({ required: true }) games: any[] = [];
  @Input() displayedColumns: string[] = ['title', 'team', 'isHomeGame', 'date', 'time'];
  @Input() deselectedIds = new Set<string>();
  @Input() gameIdFn: (game: any) => string = (game) => this.defaultGameId(game);
  @Output() selectionChange = new EventEmitter<{ game: any; selected: boolean }>();

  isSelected(game: any) {
    return !this.deselectedIds.has(this.gameIdFn(game));
  }

  toggleSelection(game: any, checked: boolean) {
    this.selectionChange.emit({ game, selected: checked });
  }

  private defaultGameId(game: any) {
    const start = new Date(game.start).toISOString();
    const end = new Date(game.end).toISOString();
    return `${start}|${end}|${game.title}`;
  }
}
