import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StoryGame {
  title: string;
  start: Date | string;
}

export interface StoryDayGroup {
  date: Date;
  games: StoryGame[];
}

@Component({
  selector: 'app-story-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './story-preview.component.html',
  styleUrl: './story-preview.component.css'
})
export class StoryPreviewComponent {
  @Input({ required: true }) groups: StoryDayGroup[] = [];
  @Input() backgroundUrl: string | null = null;
  @Input() backgroundSettings = {
    zoom: 110,
    positionX: 50,
    positionY: 50,
    blur: 0,
    brightness: 90,
    contrast: 90,
    saturate: 80,
    overlay: 35
  };

  get backgroundStyle() {
    if (!this.backgroundUrl) {
      return {};
    }

    return {
      backgroundImage: `url(${this.backgroundUrl})`,
      backgroundSize: `${this.backgroundSettings.zoom}%`,
      backgroundPosition: `${this.backgroundSettings.positionX}% ${this.backgroundSettings.positionY}%`,
      filter: `blur(${this.backgroundSettings.blur}px) brightness(${this.backgroundSettings.brightness}%) contrast(${this.backgroundSettings.contrast}%) saturate(${this.backgroundSettings.saturate}%)`
    };
  }

  get overlayStyle() {
    return {
      opacity: `${this.backgroundSettings.overlay / 100}`
    };
  }
}
