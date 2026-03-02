import { Component, EventEmitter, OnInit } from '@angular/core';
import { GamesService } from '../../services/games.service';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StoryPreviewComponent, StoryDayGroup, StoryGame } from '../story-preview/story-preview.component';
import { CalFiltersComponent } from '../cal-filters/cal-filters.component';
import { CalTableComponent } from '../cal-table/cal-table.component';
import { StoryControlsComponent } from '../story-controls/story-controls.component';
import { StoryExportButtonComponent } from '../story-export-button/story-export-button.component';
import { CalFilters } from '../../models/cal-filters.model';
import { BackgroundSettings, StorySettings } from '../../models/story-settings.model';


@Component({
  selector: 'app-cal',
  imports: [
    CommonModule,
    CalFiltersComponent,
    CalTableComponent,
    StoryPreviewComponent,
    StoryControlsComponent,
    StoryExportButtonComponent
  ],
  templateUrl: './cal.component.html',
  styleUrl: './cal.component.css'
})
export class CalComponent implements OnInit {
  currentStep = 1;
  steps = [
    { id: 1, label: 'Select events' },
    { id: 2, label: 'Background' },
    { id: 3, label: 'Download' }
  ];
  displayedColumns: string[] = ['selected', 'title', 'team', 'isHomeGame', 'date', 'time'];
  deselectedGameIds = new Set<string>();

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

  onGameSelectionChange(event: { game: any; selected: boolean }) {
    const id = this.getGameId(event.game);
    if (event.selected) {
      this.deselectedGameIds.delete(id);
    } else {
      this.deselectedGameIds.add(id);
    }
    this.applyFilters(this.filters, false);
  }

  onStorySettingsChange(settings: StorySettings) {
    this.storySettings = settings;
  }

  goToStep(stepId: number) {
    this.currentStep = stepId;
  }

  nextStep() {
    const next = Math.min(this.currentStep + 1, this.steps.length);
    this.currentStep = next;
  }

  previousStep() {
    const prev = Math.max(this.currentStep - 1, 1);
    this.currentStep = prev;
  }

  private applyFilters(filters: CalFilters, updateDateRange = true) {
    if (updateDateRange) {
      this.gamesService.setDateRange(filters.startDate, filters.endDate);
    }
    this.filteredGames$ = this.games$.pipe(
      map(games => {
        let filteredGames = games;
        filteredGames = filteredGames.filter(game => filters.selectedTeams?.includes(game.team));
        filteredGames = filteredGames.filter(game => filters.onlyHomeGames ? game.isHomeGame : true);
        return filteredGames;
      })
    );
    const storyFiltered$ = this.filteredGames$.pipe(
      map(games => games.filter(game => !this.deselectedGameIds.has(this.getGameId(game))))
    );
    this.storyGroups$ = storyFiltered$.pipe(map(games => this.groupGamesByDate(games)));
  }

  getGameId(game: any) {
    const start = new Date(game.start).toISOString();
    const end = new Date(game.end).toISOString();
    return `${start}|${end}|${game.title}`;
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
