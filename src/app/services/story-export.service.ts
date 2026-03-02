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

    await document.fonts.ready;
    await this.waitForBackgroundStyle(element);
    await this.waitForImages(element);

    const elementWidth = element.offsetWidth || 360;
    const scale = width / elementWidth;
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: scale
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }

  private async waitForImages(root: HTMLElement) {
    const imgElements = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
    const imgPromises = imgElements.map(img => {
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const onDone = () => resolve();
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
    const match = /url\(["']?(.*?)["']?\)/.exec(bg);
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
}
