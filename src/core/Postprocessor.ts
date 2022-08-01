import { logger } from '@utils';
import { CameraProps, DrawImageParameters } from '@types';

import { CanvasHandler } from './CanvasHandler';
import { CoreCamera } from './CoreCamera';

type CropInstructions = {
  width: number;
  height: number;
};

/**
 * This object is concerned with the altering of captures done with the camera.
 */
class Postprocessor extends CoreCamera {
  protected _capture?: Blob;
  protected _canvas: HTMLCanvasElement;
  protected _cropDimensions: CropInstructions;
  protected _canvasHandler: CanvasHandler;

  constructor(props: CameraProps) {
    super(props);
    this._canvas = props.canvas;
    this._canvasHandler = new CanvasHandler({ canvas: props.canvas });
  }

  protected get capture() {
    return this._capture;
  }

  protected set capture(capture: Blob) {
    this._capture = capture;
  }

  protected get canvasHandler() {
    return this._canvasHandler;
  }

  /**
   * Scales the image by a given factor and returns the new scaled image as blob.
   */
  protected async scale(byFactor: number): Promise<Blob> {
    const bitmap = await createImageBitmap(await this._canvasHandler.getBlob());
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
    const downscaledImgBlob = await this._canvasHandler.draw(bitmap, params);
    return downscaledImgBlob;
  }

  /**
   * Recolours the image to black and white.
   * This method is considered the best in terms of compression,
   * but in some cases it can recolour text to be the same as the background.
   */
  protected async blackAndWhite(): Promise<Blob> {
    const imgData = this._canvasHandler.getCanvasContents();

    for (let i = 0; i < imgData.data.length; i += 4) {
      let count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
      let colour = 0;
      if (count > 383) colour = 255;

      imgData.data[i] = colour;
      imgData.data[i + 1] = colour;
      imgData.data[i + 2] = colour;
      imgData.data[i + 3] = 255;
    }

    const bwImgBlob = await this._canvasHandler.draw(imgData, { dx: 0, dy: 0 });
    return bwImgBlob;
  }

  /**
   * Recolours the image to be grayscale.
   * This is less effective for compression than B&W, but is safer.
   */
  protected async grayscale(): Promise<Blob> {
    const imgData = this._canvasHandler.getCanvasContents();

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
      dy: 0
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
        logger.log('Verbose', () => {
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
        });
        URL.revokeObjectURL(image.src);
      };
    }
  }
}

export { Postprocessor };
