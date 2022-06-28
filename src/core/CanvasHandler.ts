import { RefObject } from 'react';

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

type CanvasDimensions = {
  width: number;
  height: number;
};

type AllowedMimeTypes = 'image/bmp' | 'image/png' | 'image/jpeg' | 'image/tiff';

interface CanvasHandlerProps {
  canvasRef: RefObject<HTMLCanvasElement>;
}

/**
 * This object implements different operations on the postprocessing canvas.
 */
class CanvasHandler {
  private _canvas: HTMLCanvasElement;
  private _canvasContext: CanvasRenderingContext2D;
  private readonly _standardCanvasDimensions: CanvasDimensions;

  constructor(props: CanvasHandlerProps) {
    if (props.canvasRef == null)
      throw new Error(
        'Could not construct CanvasHandler. The canvas element reference is missing.'
      );
    this._canvas = props.canvasRef.current;
    this._canvasContext = props.canvasRef.current.getContext('2d');
    this._standardCanvasDimensions = {
      width: props.canvasRef.current.width,
      height: props.canvasRef.current.height
    };
  }

  public get canvas() {
    return this._canvas;
  }
  /**
   * Accepts an image source and draws it onto the canvas with the drawing instructions.
   * @returns {Blob} A blob representation of the new canvas.
   */
  public draw(
    image: CanvasImageSource | ImageData,
    params: DrawImageParameters
  ): Promise<Blob> {
    const runDrawing = () => {
      if (!(image instanceof ImageData)) {
        this._canvasContext.drawImage(
          image,
          params.sx,
          params.sy,
          params.sWidth,
          params.sHeight,
          params.dx,
          params.dy,
          params.dWidth,
          params.dHeight
        );
      } else {
        this._canvasContext.putImageData(image, params.dx, params.dy);
      }
    };

    return new Promise((resolve) => {
      this.clearCanvas()
        .then(runDrawing)
        .then(() => resolve(this.getBlob(1, 'image/jpeg')));
    });
  }

  /**
   * Returns the current canvas content as ImageData.
   */
  public getCanvasContents(): Promise<ImageData> {
    return new Promise((resolve) => {
      resolve(this._canvasContext.getImageData(0, 0, 1920, 1080));
    });
  }

  /**
   * Returns the contents of the canvas as a blob.
   * @param quality {number|undefined} A number between 0 and 1 indicating the image quality.
   * @param mimeType {string|undefined} A valid mime type.
   */
  public getBlob(
    quality?: number,
    mimeType?: AllowedMimeTypes
  ): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      if ((typeof quality === 'number' && quality < 0) || quality > 1) {
        reject('Quality must be between 0 and 1, got ' + quality + '.');
      }

      this._canvas.toBlob(
        (blobbedDrawing?: Blob) => {
          resolve(blobbedDrawing);
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Erases the canvas.
   */
  public clearCanvas(): Promise<void> {
    return new Promise((resolve) => {
      this._canvasContext.clearRect(
        0,
        0,
        this._canvas.width,
        this._canvas.height
      );
      this._canvasContext.beginPath();

      resolve();
    });
  }
}

export { CanvasHandler };
