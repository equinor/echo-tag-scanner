import { getViewMode } from '@utils';
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
  private _currentOrientation: 'landscape' | 'portrait';

  constructor(props: CanvasHandlerProps) {
    if (!props.canvas)
      throw new Error(
        'Could not construct CanvasHandler. The canvas element reference is missing.'
      );
    this._canvas = props.canvas;
    this._canvasContext = this._canvas.getContext('2d');
    this._standardCanvasDimensions = {
      width: this._canvas.width,
      height: this._canvas.height
    };

    /**
     * This will save the initial canvas dimensions when the device changes its orientation.
     * It is done because we also downscale the canvas during a downscale operation.
     *  An alternative approach now in use is to set the canvas dimensions to whatever is being
     * drawn on it (see this.draw). Code below can maybe be removed.
     */
    this._currentOrientation = getViewMode();
    const orientationResizer = new ResizeObserver((entry) => {
      const newOrientation = getViewMode();

      if (entry[0] && newOrientation !== this._currentOrientation) {
        this._currentOrientation = newOrientation;
        this._standardCanvasDimensions = {
          width: entry[0].contentRect.width,
          height: entry[0].contentRect.height
        };
        console.log(
          'device orientation changed -> ',
          this._standardCanvasDimensions
        );
        this.logCanvasStats();
      }
    });
    orientationResizer.observe(this._canvas);
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
    //--------------
    function drawImage() {
      // Before drawing, set the canvas dimensions to be equal to whatever is being drawn.
      this._canvas.width = params.dWidth;
      this._canvas.height = params.dHeight;
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
    }

    this.clearCanvas();
    drawImage.call(this);
    return await this.getBlob(1, 'image/jpeg');
  }

  /**
   * Returns the current canvas content as ImageData.
   */
  public getCanvasContents(
    sw?: number,
    sh?: number,
    settings?: ImageDataSettings
  ): ImageData {
    return this._canvasContext.getImageData(
      0,
      0,
      sw ?? this._standardCanvasDimensions.width,
      sh ?? this._standardCanvasDimensions.height,
      settings
    );
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
   * Erases and resets the canvas.
   */
  public clearCanvas(): void {
    this._canvasContext.clearRect(
      0,
      0,
      this._canvas.width,
      this._canvas.height
    );
    this._canvasContext.beginPath();
  }

  public logCanvasStats() {
    console.group('Canvas info');
    console.info('Dimensions w/h', this._canvas.width, this._canvas.height);
    console.groupEnd();
  }
}

export { CanvasHandler };
