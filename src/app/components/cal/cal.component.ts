import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { GamesService } from '../../services/games.service';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {MatSelectModule} from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { StoryPreviewComponent, StoryDayGroup, StoryGame } from '../story-preview/story-preview.component';


@Component({
  selector: 'app-cal',
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    StoryPreviewComponent
  ],
  templateUrl: './cal.component.html',
  styleUrl: './cal.component.css'
})
export class CalComponent implements OnInit {
  displayedColumns: string[] = ['title', 'team', 'isHomeGame', 'date', 'time'];

  teams: string[] = this.gamesService.teams;
  selectedTeams = new FormControl(this.gamesService.teams.slice());
  onlyHomeGames = new FormControl(false);
  startDate = new FormControl(this.gamesService.defaultStartDate);
  endDate = new FormControl(this.gamesService.defaultEndDate);

  filterForm = new FormGroup({
    selectedTeams: this.selectedTeams,
    onlyHomeGames: this.onlyHomeGames,
    startDate: this.startDate,
    endDate: this.endDate
  });
  filterChange: EventEmitter<any> = new EventEmitter();

  constructor(private gamesService: GamesService) {
  }

  ngOnInit() {
    this.filterForm.valueChanges.subscribe(filters => {
      const start = filters.startDate ?? this.gamesService.defaultStartDate;
      const end = filters.endDate ?? this.gamesService.defaultEndDate;
      this.gamesService.setDateRange(start, end);
      //this.filterChange.emit(filters);
      this.filteredGames$ = this.games$.pipe(
        map(games => {
          console.log(filters);
          let filteredGames = games;
          filteredGames = filteredGames.filter(game => filters.selectedTeams?.includes(game.team));
          filteredGames = filteredGames.filter(game => filters.onlyHomeGames ? game.isHomeGame : true);
          return filteredGames;
        })
      );
      this.storyGroups$ = this.filteredGames$.pipe(
        map(games => this.groupGamesByDate(games))
      );
    });
  }

  games$: Observable<any[]> = this.gamesService.games$;
  filteredGames$ = this.games$;
  storyGroups$ = this.filteredGames$.pipe(
    map(games => this.groupGamesByDate(games))
  );

  selectAllTeams() {
    this.selectedTeams.setValue(this.teams.slice());
  }

  deselectAllTeams() {
    this.selectedTeams.setValue([]);
  }

  setNextDaysRange(days: number) {
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    this.startDate.setValue(start);
    this.endDate.setValue(end);
  }

  private groupGamesByDate(games: StoryGame[]): StoryDayGroup[] {
    const grouped = new Map<string, StoryDayGroup>();

    games.forEach(game => {
      const dateObj = new Date(game.start);
      const dateKey = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      const key = dateKey.toISOString();

      const existing = grouped.get(key);
      if (existing) {
        existing.games.push(game);
      } else {
        grouped.set(key, { date: dateKey, games: [game] });
      }
    });

    return Array.from(grouped.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

}
