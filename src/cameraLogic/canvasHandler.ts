import {
  AllowedMimeTypes,
  CanvasDimensions,
  DrawImageParameters,
  GetFromCanvasParameters
} from '@types';

/**
 * This object implements different operations on the postprocessing canvas.
 */
export class CanvasHandler {
  private readonly _standardCanvasDimensions: CanvasDimensions;
  private _canvas: HTMLCanvasElement | OffscreenCanvas;
  private _canvasContext:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
    if (!canvas)
      throw new Error(
        'Could not construct CanvasHandler. The canvas element reference is missing.'
      );

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Did not get a reference to a new canvas context');
    }

    this._canvas = canvas;
    this._canvasContext = context;
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
  public draw(
    image: CanvasImageSource | ImageData,
    params: DrawImageParameters
  ): ImageData {
    if (params.dWidth === 0 || params.dHeight === 0) {
      throw new Error(
        'Could not draw image onto a canvas with zero height or width'
      );
    }
    // Blank the canvas before a draw.
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

    return this.getCanvasContents({
      sWidth: params.sWidth,
      sHeight: params.sHeight,
      quality: 1,
      mimeType: 'image/jpeg'
    });
  }

  /**
   * Returns the current canvas content as Blob.
   */
  public async getCanvasContentAsBlob(
    params: GetFromCanvasParameters
  ): Promise<Blob> {
    if (this.canvas instanceof OffscreenCanvas) {
      return this.canvas.convertToBlob({
        quality: params.quality,
        type: params.mimeType
      });
    } else {
      const canvas = this.canvas;
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blobbedDrawing) => {
            if (blobbedDrawing) {
              resolve(blobbedDrawing);
            } else {
              reject('Could not get a blob from the canvas.');
            }
          },
          params.mimeType ?? 'image/jpeg',
          1
        );
      });
    }
  }

  /**
   * Returns the current canvas content as ImageData.
   */
  public getCanvasContents(
    getParams: GetFromCanvasParameters,
    imageDataSettings?: ImageDataSettings
  ): ImageData {
    return this._canvasContext.getImageData(
      getParams.sx ?? 0,
      getParams.sy ?? 0,
      getParams.sWidth,
      getParams.sHeight,
      imageDataSettings
    );
  }

  public async createImageBitmap(
    options?: ImageBitmapOptions
  ): Promise<ImageBitmap> {
    return createImageBitmap(this.canvas, options);
  }

  public async createBlobFromImageData(imageData: ImageData): Promise<Blob> {
    const w = imageData.width;
    const h = imageData.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error(
        'Failed to create canvas context for converting image data to blob'
      );
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blobbedDrawing) => {
          if (blobbedDrawing) {
            resolve(blobbedDrawing);
          } else {
            reject('Could not get a blob from the canvas.');
          }
        },
        'image/jpeg',
        1
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
