import { getOrientation, logger } from '@utils';
import {
  AllowedMimeTypes,
  CanvasDimensions,
  CanvasHandlerProps,
  DrawImageParameters
} from '@types';

/**
 * This object implements different operations on the postprocessing canvas.
 */
class CanvasHandler {
  private _canvas: HTMLCanvasElement;
  protected _canvasContext: CanvasRenderingContext2D;
  private _standardCanvasDimensions: CanvasDimensions;

  constructor(props: CanvasHandlerProps) {
    if (!props.canvas)
      throw new Error(
        'Could not construct CanvasHandler. The canvas element reference is missing.'
      );
    this._canvas = props.canvas;
    const context = this._canvas.getContext('2d');

    if (context) {
      this._canvasContext = context;
    } else {
      throw new Error('Did not get a reference to a new canvas context');
    }

    this._standardCanvasDimensions = {
      width: this._canvas.width,
      height: this._canvas.height
    };
  }

  public get canvasContext() {
    return this._canvasContext;
  }

  public get canvas() {
    return this._canvas;
  }
  /**
   * Accepts an image source and draws it onto the canvas with the drawing instructions.
   * @returns {Blob} A blob representation of the new canvas.
   */
  public async draw(
    image: CanvasImageSource | ImageData,
    params: DrawImageParameters
  ): Promise<Blob> {
    if (params.dWidth === 0 || params.dHeight === 0) {
      throw new Error(
        'Could not draw image onto a canvas with zero height or width'
      );
    }
    // Before drawing, set the canvas dimensions to be equal to whatever is being drawn..
    this._canvas.width = params.dWidth;
    this._canvas.height = params.dHeight;

    // ..and blank the canvas.
    this.clearCanvas();

    if (image instanceof ImageData) {
      this._canvasContext?.putImageData(image, params.dx, params.dy);
    } else {
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
    }

    return this.getBlob(1, 'image/jpeg');
  }

  /**
   * Returns the current canvas content as ImageData.
   */
  public getCanvasContents(
    sw?: number,
    sh?: number,
    settings?: ImageDataSettings
  ): ImageData {
    const imageData = this._canvasContext?.getImageData(
      0,
      0,
      sw ?? this._standardCanvasDimensions.width,
      sh ?? this._standardCanvasDimensions.height,
      settings
    );

    if (imageData) {
      return imageData;
    } else throw new Error('Failed to get imagedata from the canvas');
  }

  /**
   * Returns the contents of the canvas as a blob.
   * @param quality {number|undefined} A number between 0 and 1 indicating the image quality.
   * @param mimeType {string|undefined} A valid mime type.
   */
  public getBlob(quality?: number, mimeType?: AllowedMimeTypes): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if ((typeof quality === 'number' && quality < 0) || Number(quality) > 1) {
        reject('Quality must be between 0 and 1, got ' + quality + '.');
      }

      this._canvas.toBlob(
        (blobbedDrawing) => {
          if (blobbedDrawing) resolve(blobbedDrawing);
          else reject('Could not get a blob from the canvas.');
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Erases and resets the canvas.
   */
  public clearCanvas(): void {
    this._canvasContext?.clearRect(
      0,
      0,
      this._canvas.width,
      this._canvas.height
    );
    this._canvasContext?.beginPath();
  }
}

export { CanvasHandler };
