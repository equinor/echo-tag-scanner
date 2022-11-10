import {
  CameraProps,
  CanvasDimensions,
  CropSettings,
  DrawImageParameters
} from '@types';
import { CanvasHandler } from './canvasHandler';
import { CoreCamera } from './coreCamera';

/**
 * This object is concerned with the altering of captures done with the camera.
 */
class Postprocessor extends CoreCamera {
  protected _capture?: Blob;
  protected _canvas: HTMLCanvasElement;
  protected _canvasHandler: CanvasHandler;

  constructor(props: CameraProps) {
    super(props);
    this._canvas = props.canvas;
    this._canvasHandler = new CanvasHandler({
      canvas: props.canvas,
      standardCanvasDimensions: {
        width: this.viewfinder.videoWidth,
        height: this.viewfinder.videoHeight
      }
    });
  }

  protected get capture(): Blob | undefined {
    return this._capture;
  }

  protected set capture(capture: Blob | undefined) {
    this._capture = capture;
  }

  protected get canvasHandler() {
    return this._canvasHandler;
  }

  /**
   * Performs a crop operation on the current contents of the canvas with the provided settings.
   * The canvas itself will also be cropped as a result.
   * @param {CropSettings} settings Should contain the coordinate positions of the starting crop position and the dimensions of the crop.
   * - sx: The x position.
   * - sy: The y position.
   * - sWidth: The width of the new cropped image.
   * - sHeight: The height of the new cropped image.
   * @returns {Promise<Blob>} The cropped image.
   */
  protected async crop(settings: CropSettings): Promise<Blob> {
    if (settings.sx < 0 || settings.sy < 0)
      throw new Error('sx or sy is below 0');
    if (settings.sx > this._canvas.height)
      throw new Error('sx is bigger than canvas');
    if (settings.sy > this._canvas.width)
      throw new Error('sy is bigger than canvas');
    const bitmap = await createImageBitmap(
      await this._canvasHandler.getBlobLegacy()
    );
    const params: DrawImageParameters = {
      sx: settings.sx,
      sy: settings.sy,
      sWidth: settings.sWidth,
      sHeight: settings.sHeight,
      dx: 0,
      dy: 0,
      dHeight: settings.sHeight,
      dWidth: settings.sWidth
    };

    this._canvasHandler.resizeCanvas({
      width: settings.sWidth,
      height: settings.sHeight
    });
    return await this._canvasHandler.draw(bitmap, params);
  }

  /**
   * Scales the image by a given factor, or no less than 50x50, and returns the new scaled image as blob.
   */
  protected async scale(byFactor: number): Promise<Blob> {
    if (byFactor <= 0) throw new Error('The scale factor cannot be 0 or less.');
    const bitmap = await createImageBitmap(
      await this._canvasHandler.getBlobLegacy()
    );

    const params: DrawImageParameters = {
      sx: 0,
      sy: 0,
      sHeight: this._canvas.height,
      sWidth: this._canvas.width,
      dx: 0,
      dy: 0,
      dHeight: this._canvas.height * byFactor,
      dWidth: this._canvas.width * byFactor
    };

    // If the scaled image is destined to become less than 50x50, we preserve the original dimensions.
    if (params.dHeight <= 50 && params.dWidth <= 50) {
      params.dHeight = this._canvas.height;
      params.dWidth = this._canvas.width;
    }
    return await this._canvasHandler.draw(bitmap, params);
  }

  /**
   * Recolours the image to black and white.
   * This method is considered the best in terms of compression,
   * but in some cases it can recolour text to be the same as the background.
   */
  protected async blackAndWhite(): Promise<Blob> {
    console.warn(
      'This function will not do anything at the moment. Check sWidth and sHeight on next line'
    );
    const imgData = this._canvasHandler.getCanvasContents({
      sWidth: 0,
      sHeight: 0
    });

    for (let i = 0; i < imgData.data.length; i += 4) {
      let count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
      let colour = 0;
      if (count > 383) colour = 255;

      imgData.data[i] = colour;
      imgData.data[i + 1] = colour;
      imgData.data[i + 2] = colour;
      imgData.data[i + 3] = 255;
    }

    const bwImgBlob = await this._canvasHandler.draw(imgData, {
      dx: 0,
      dy: 0,
      sx: 0,
      sy: 0,
      sWidth: 0,
      sHeight: 0,
      dWidth: 0,
      dHeight: 0
    });
    return bwImgBlob;
  }

  /**
   * Recolours the image to be grayscale.
   * This is less effective for compression than B&W, but is safer.
   */
  protected async grayscale(): Promise<Blob> {
    console.warn(
      'This function will not do anything at the moment. Check sWidth and sHeight on next line'
    );
    const imgData = this._canvasHandler.getCanvasContents({
      sWidth: 0,
      sHeight: 0
    });

    for (let i = 0; i < imgData.data.length; i += 4) {
      let count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];

      let colour = 0;
      if (count > 510) colour = 255;
      else if (count > 255) colour = 127.5;

      imgData.data[i] = colour;
      imgData.data[i + 1] = colour;
      imgData.data[i + 2] = colour;
      imgData.data[i + 3] = 255;
    }
    const grayscaleImgBlob = await this._canvasHandler.draw(imgData, {
      dx: 0,
      dy: 0,
      sx: 0,
      sy: 0,
      sWidth: 0,
      sHeight: 0,
      dWidth: 0,
      dHeight: 0
    });

    return grayscaleImgBlob;
  }

  /**
   * Logs image statistics to the console.
   */
  protected logImageStats(target: Blob | File, logDescription?: string) {
    if (target) {
      const image = new Image();
      image.src = URL.createObjectURL(target);
      image.onload = () => {
        console.group(logDescription);
        console.info('Photo size in bytes: ', target.size);
        console.info('Media type: ', target.type);
        console.info(
          'Dimensions: ' +
            'Width: ' +
            image.width +
            ' ' +
            'Height: ' +
            image.height
        );
        console.groupEnd();
        URL.revokeObjectURL(image.src);
      };
    }
  }
}

export { Postprocessor };
