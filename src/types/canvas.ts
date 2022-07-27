export type DrawImageParameters = {
  sx?: number;
  sy?: number;
  sWidth?: number;
  sHeight?: number;
  dx?: number;
  dy?: number;
  dWidth?: number;
  dHeight?: number;
};

export type CanvasDimensions = {
  width: number;
  height: number;
};

export type AllowedMimeTypes =
  | 'image/bmp'
  | 'image/png'
  | 'image/jpeg'
  | 'image/tiff';

export interface CanvasHandlerProps {
  canvas: HTMLCanvasElement;
}
