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
}
