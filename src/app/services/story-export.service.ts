import { Injectable } from '@angular/core';
import { toPng } from 'html-to-image';

@Injectable({
  providedIn: 'root'
})
export class StoryExportService {
  async exportPng(options: {
    target: HTMLElement | null;
    selector?: string;
    filename?: string;
    width?: number;
    height?: number;
  }) {
    const {
      target,
      selector = '.story-canvas',
      filename = 'story-export.png',
      width = 1080
    } = options;

    if (!target) {
      return;
    }

    const element = selector ? target.querySelector<HTMLElement>(selector) : target;
    if (!element) {
      return;
    }

    const elementWidth = element.offsetWidth || 360;
    const scale = width / elementWidth;

    await toPng(element, {
      cacheBust: true,
      pixelRatio: scale
    });
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: scale
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }
}
