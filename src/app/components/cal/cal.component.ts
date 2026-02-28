import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { toPng } from 'html-to-image';
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
  backgroundUrl: string | null = null;
  backgroundSettings: BackgroundSettings = {
    zoom: 110,
    positionX: 50,
    positionY: 50,
    blur: 0,
    brightness: 90,
    contrast: 90,
    saturate: 80,
    overlay: 35
  };
  backgroundEnabled = true;
  fillPills = false;
  showLogo = true;
  logoUrl = '/voorwaarts.png';
  logoMarginTop = 0;
  logoMarginBottom = 0;
  titleText = '';
  logoPosition: 'left' | 'center' | 'right' = 'center';
  exporting = false;

  @ViewChild('storyCapture') storyCapture?: ElementRef<HTMLDivElement>;

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

  onBackgroundSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.backgroundUrl = typeof reader.result === 'string' ? reader.result : null;
    };
    reader.readAsDataURL(file);
  }

  applyPreset(preset: { values: BackgroundSettings }) {
    const current = this.backgroundSettings;
    this.backgroundSettings = {
      ...preset.values,
      zoom: current.zoom,
      positionX: current.positionX,
      positionY: current.positionY
    };
  }

  async downloadStoryImage() {
    if (this.exporting || !this.storyCapture?.nativeElement) {
      return;
    }

    this.exporting = true;
    try {
      const source = this.storyCapture.nativeElement.querySelector('.story-canvas') as HTMLElement | null;
      if (!source) {
        return;
      }

      await document.fonts.ready;
      await this.waitForBackgroundStyle(source);
      await this.waitForImages(source);
      const width = source.offsetWidth || 360;
      const scale = 1080 / width;
      const dataUrl = await toPng(source, {
        cacheBust: true,
        pixelRatio: scale
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'story-export.png';
      link.click();
    } finally {
      this.exporting = false;
    }
  }

  private async waitForImages(root: HTMLElement) {
    const imgElements = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
    const imgPromises = imgElements.map(img => {
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const onDone = () => {
          img.removeEventListener('load', onDone);
          img.removeEventListener('error', onDone);
          resolve();
        };
        img.addEventListener('load', onDone, { once: true });
        img.addEventListener('error', onDone, { once: true });
      });
    });

    const bgElements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('.story-bg'))];
    const bgPromises = bgElements.map(el => this.preloadBackgroundImage(el));

    await Promise.all([...imgPromises, ...bgPromises]);
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }

  private async waitForBackgroundStyle(root: HTMLElement) {
    const bgEl = root.querySelector<HTMLElement>('.story-bg');
    if (!bgEl) {
      return;
    }

    const start = Date.now();
    while (Date.now() - start < 500) {
      const bg = getComputedStyle(bgEl).backgroundImage;
      if (bg && bg !== 'none') {
        return;
      }
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
  }

  private async preloadBackgroundImage(el: HTMLElement) {
    const bg = getComputedStyle(el).backgroundImage;
    const match = /url\\([\"']?(.*?)[\"']?\\)/.exec(bg);
    if (!match || !match[1] || match[1] === 'none') {
      return;
    }

    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = match[1];
    });
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

type BackgroundSettings = {
  zoom: number;
  positionX: number;
  positionY: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturate: number;
  overlay: number;
};
