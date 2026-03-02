export type BackgroundSettings = {
  zoom: number;
  positionX: number;
  positionY: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturate: number;
  overlay: number;
};

export type StorySettings = {
  backgroundUrl: string | null;
  backgroundEnabled: boolean;
  backgroundSettings: BackgroundSettings;
  fillPills: boolean;
  showLogo: boolean;
  logoUrl: string | null;
  logoMarginTop: number;
  logoMarginBottom: number;
  titleText: string;
  logoPosition: 'left' | 'center' | 'right';
};
