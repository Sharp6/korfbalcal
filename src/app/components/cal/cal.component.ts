import { Component, EventEmitter, OnInit } from '@angular/core';
import { GamesService } from '../../services/games.service';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StoryPreviewComponent, StoryDayGroup, StoryGame } from '../story-preview/story-preview.component';
import { CalFiltersComponent } from '../cal-filters/cal-filters.component';
import { CalTableComponent } from '../cal-table/cal-table.component';
import { StoryControlsComponent } from '../story-controls/story-controls.component';
import { CalFilters } from '../../models/cal-filters.model';
import { BackgroundSettings, StorySettings } from '../../models/story-settings.model';


@Component({
  selector: 'app-cal',
  imports: [
    CommonModule,
    CalFiltersComponent,
    CalTableComponent,
    StoryPreviewComponent,
    StoryControlsComponent
  ],
  templateUrl: './cal.component.html',
  styleUrl: './cal.component.css'
})
export class CalComponent implements OnInit {
  displayedColumns: string[] = ['title', 'team', 'isHomeGame', 'date', 'time'];

  teams: string[] = this.gamesService.teams;
  filters: CalFilters = {
    selectedTeams: this.gamesService.teams.slice(),
    onlyHomeGames: false,
    startDate: this.gamesService.defaultStartDate,
    endDate: this.gamesService.defaultEndDate
  };
  filterChange: EventEmitter<CalFilters> = new EventEmitter();

  constructor(private gamesService: GamesService) {
  }

  ngOnInit() {
    this.applyFilters(this.filters);
  }

  games$: Observable<any[]> = this.gamesService.games$;
  filteredGames$ = this.games$;
  storyGroups$ = this.filteredGames$.pipe(
    map(games => this.groupGamesByDate(games))
  );
  storySettings: StorySettings = {
    backgroundUrl: null,
    backgroundEnabled: true,
    backgroundSettings: {
      zoom: 110,
      positionX: 50,
      positionY: 50,
      blur: 0,
      brightness: 90,
      contrast: 90,
      saturate: 80,
      overlay: 35
    },
    fillPills: false,
    showLogo: true,
    logoUrl: '/voorwaarts.png',
    logoMarginTop: 0,
    logoMarginBottom: 0,
    titleText: '',
    logoPosition: 'center'
  };

  presets: { label: string; values: BackgroundSettings }[] = [
    {
      label: 'Subtle',
      values: { zoom: 110, positionX: 50, positionY: 50, blur: 2, brightness: 95, contrast: 90, saturate: 75, overlay: 45 }
    },
    {
      label: 'Muted',
      values: { zoom: 115, positionX: 50, positionY: 50, blur: 4, brightness: 92, contrast: 85, saturate: 60, overlay: 55 }
    },
    {
      label: 'Punchy',
      values: { zoom: 110, positionX: 50, positionY: 50, blur: 1, brightness: 100, contrast: 105, saturate: 110, overlay: 30 }
    }
  ];

  onFiltersChange(filters: CalFilters) {
    this.filters = filters;
    this.applyFilters(filters);
  }

  onStorySettingsChange(settings: StorySettings) {
    this.storySettings = settings;
  }

  private applyFilters(filters: CalFilters) {
    this.gamesService.setDateRange(filters.startDate, filters.endDate);
    this.filteredGames$ = this.games$.pipe(
      map(games => {
        let filteredGames = games;
        filteredGames = filteredGames.filter(game => filters.selectedTeams?.includes(game.team));
        filteredGames = filteredGames.filter(game => filters.onlyHomeGames ? game.isHomeGame : true);
        return filteredGames;
      })
    );
    this.storyGroups$ = this.filteredGames$.pipe(
      map(games => this.groupGamesByDate(games))
    );
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
