export enum AppState {
  UPLOAD = 'UPLOAD',
  EDITING = 'EDITING',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
}

export interface TextStyle {
  font: string;
  fillStyle: string | { gradient: string[] };
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  position: { x: number; y: number }; // Posición relativa (0.0 a 1.0)
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  strokeColor?: string;
  strokeWidth?: number;
  maxWidthFactor?: number; // Factor del ancho del lienzo para el ajuste de línea
}