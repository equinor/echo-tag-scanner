import {
  AllowedMimeTypes,
  CanvasDimensions,
  CanvasHandlerProps,
  DrawImageParameters,
  GetFromCanvasParameters
} from '@types';

/**
 * This object implements different operations on the postprocessing canvas.
 */
class CanvasHandler {
  private _canvas: HTMLCanvasElement;
  protected _canvasContext: CanvasRenderingContext2D;
  private readonly _standardCanvasDimensions: CanvasDimensions;

  constructor(props: CanvasHandlerProps) {
    if (!props.canvas)
      throw new Error(
        'Could not construct CanvasHandler. The canvas element reference is missing.'
      );
    this._canvas = props.canvas;
    const context = this._canvas.getContext('2d', { willReadFrequently: true });

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
    // .Blank the canvas before a draw.
    this.clearCanvas();

    this.canvas.width = params.dWidth;
    this.canvas.height = params.dHeight;

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

    return this.getBlobLegacy(1, 'image/jpeg');
  }

  /**
   * Returns the current canvas content as Blob.
   */
  public async getCanvasContentAsBlob(
    params: GetFromCanvasParameters
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const imageData = this.getCanvasContents(params);
      const tempCanvas: HTMLCanvasElement = document.createElement('canvas');

      // Set explicit heights since a canvas is by default 300x150
      tempCanvas.width = params.sWidth;
      tempCanvas.height = params.sHeight;

      const tempCanvasContext = tempCanvas.getContext('2d');
      tempCanvasContext?.putImageData(imageData, 0, 0);

      tempCanvas.toBlob(
        (blobbedDrawing) => {
          if (blobbedDrawing) {
            tempCanvas.remove();
            resolve(blobbedDrawing);
          } else {
            tempCanvas.remove();
            reject('Could not get a blob from the canvas.');
          }
        },
        params.mimeType ?? 'image/jpeg',
        1
      );
    });
  }

  /**
   * Returns the current canvas content as ImageData.
   */
  public getCanvasContents(
    getParams: GetFromCanvasParameters,
    imageDataSettings?: ImageDataSettings
  ): ImageData {
    return this._canvasContext?.getImageData(
      getParams.sx ?? 0,
      getParams.sy ?? 0,
      getParams.sWidth,
      getParams.sHeight,
      imageDataSettings
    );
  }

  /**
   * Returns the entire contents of the canvas as a blob.
   * @param quality {number|undefined} A number between 0 and 1 indicating the image quality.
   * @param mimeType {string|undefined} A valid mime type.
   * @deprecated use CanvasHandler.getCanvasContentAsBlob instead.
   */
  public getBlobLegacy(
    quality?: number,
    mimeType?: AllowedMimeTypes
  ): Promise<Blob> {
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

  public scaleCanvas(xFactor: number, yFactor: number) {
    this._canvasContext.scale(xFactor, yFactor);
  }

  public resizeCanvas(newDimensions: CanvasDimensions) {
    if (newDimensions.width > 0 && newDimensions.height > 0) {
      this._canvas.width = newDimensions.width;
      this._canvas.height = newDimensions.height;
    } else {
      throw new Error(
        `Unable to resize the canvas with the following dimensions: ${newDimensions.width}x${newDimensions.height}`
      );
    }
  }

  /**
   * Erases and resets the canvas.
   */
  public clearCanvas(): void {
    this.canvas.height = this._standardCanvasDimensions.height;
    this.canvas.width = this._standardCanvasDimensions.width;
    this._canvasContext?.clearRect(
      0,
      0,
      this._standardCanvasDimensions.width,
      this._standardCanvasDimensions.height
    );
    this._canvasContext?.beginPath();
  }
}

export { CanvasHandler };
