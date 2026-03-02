import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { StoryExportService } from '../../services/story-export.service';

@Component({
  selector: 'app-story-export-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './story-export-button.component.html',
  styleUrl: './story-export-button.component.css'
})
export class StoryExportButtonComponent {
  @Input() target: HTMLElement | null = null;
  @Input() selector = '.story-canvas';
  @Input() filename = 'story-export.png';
  @Input() width = 1080;
  @Input() disabled = false;

  exporting = false;
  errorMessage = '';

  constructor(private exportService: StoryExportService) {}

  async exportImage() {
    if (this.exporting || this.disabled) {
      return;
    }

    this.exporting = true;
    this.errorMessage = '';
    try {
      await this.exportService.exportPng({
        target: this.target,
        selector: this.selector,
        filename: this.filename,
        width: this.width
      });
    } catch (error) {
      this.errorMessage = 'Export mislukt. Probeer opnieuw.';
      console.error(error);
    } finally {
      this.exporting = false;
    }
  }
}
