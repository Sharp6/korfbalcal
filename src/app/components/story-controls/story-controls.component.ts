import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { BackgroundSettings, StorySettings } from '../../models/story-settings.model';

@Component({
  selector: 'app-story-controls',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './story-controls.component.html',
  styleUrl: './story-controls.component.css'
})
export class StoryControlsComponent {
  @Input({ required: true }) settings!: StorySettings;
  @Input() presets: { label: string; values: BackgroundSettings }[] = [];
  @Output() settingsChange = new EventEmitter<StorySettings>();

  onBackgroundSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.updateSettings({ backgroundUrl: typeof reader.result === 'string' ? reader.result : null });
    };
    reader.readAsDataURL(file);
  }

  applyPreset(preset: { values: BackgroundSettings }) {
    const current = this.settings.backgroundSettings;
    this.updateSettings({
      backgroundSettings: {
        ...preset.values,
        zoom: current.zoom,
        positionX: current.positionX,
        positionY: current.positionY
      }
    });
  }

  updateBackgroundSetting<K extends keyof BackgroundSettings>(key: K, value: BackgroundSettings[K]) {
    this.updateSettings({
      backgroundSettings: {
        ...this.settings.backgroundSettings,
        [key]: value
      }
    });
  }

  updateSettings(partial: Partial<StorySettings>) {
    this.settingsChange.emit({
      ...this.settings,
      ...partial
    });
  }
}
