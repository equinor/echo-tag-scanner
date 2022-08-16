import { getOrientation, logger } from '@utils';
import {
  AllowedMimeTypes,
  CanvasDimensions,
  CanvasHandlerProps,
  DrawImageParameters
} from '@types';
import EchoUtils from '@equinor/echo-utils';

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

    const context = this._canvas.getContext('2d');

    if (context) {
      this._canvasContext = context;
    } else {
      throw new Error('fuk u');
    }

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
    this._currentOrientation = getOrientation();
    const orientationResizer = new ResizeObserver((entry) => {
      const newOrientation = getOrientation();

      if (entry[0] && newOrientation !== this._currentOrientation) {
        this._currentOrientation = newOrientation;
        this._standardCanvasDimensions = {
          width: entry[0].contentRect.width,
          height: entry[0].contentRect.height
        };
        console.info(
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
    this.clearCanvas();

    if (image instanceof ImageData) {
      // Before drawing, set the canvas dimensions to be equal to whatever is being drawn.
      this._canvas.width = params.dWidth ?? 0;
      this._canvas.height = params.dHeight ?? 0;
      this._canvasContext?.putImageData(image, params.dx, params.dy);
    } else {
      // Always set canvas to be equal to source image size before drawing
      this._canvas.width = params.dWidth;
      this._canvas.height = params.dHeight;

      this._canvasContext.drawImage(
        image,
        params.sx,
        params.sy,
        params.sWidth,
        params.sHeight,
        0,
        0,
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

      console.log(
        'CANVAS WIDTH/HEIGHT in GETBLOB: ',
        this._canvas.width,
        this._canvas.height
      );

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

  public logCanvasStats() {
    logger.log('Info', () => {
      console.group('Canvas info');
      console.info('Dimensions w/h', this._canvas.width, this._canvas.height);
      console.groupEnd();
    });
  }
}

export { CanvasHandler };
