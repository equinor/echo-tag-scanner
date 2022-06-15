import { RefObject } from 'react';
import { CanvasHandler, DrawImageParameters } from './CanvasHandler';
import { CoreCamera } from './CoreCamera';

interface PostprocessorProps {
  canvas?: RefObject<HTMLCanvasElement>;
  viewfinder: RefObject<HTMLVideoElement>;
  additionalCaptureOptions?: DisplayMediaStreamConstraints;
}

type CropInstructions = {
  width: number;
  height: number;
};

class Postprocessor extends CoreCamera {
  protected _capture?: Blob;
  protected _canvas?: RefObject<HTMLCanvasElement>;
  protected _cropDimensions: CropInstructions;
  protected _canvasHandler: CanvasHandler;

  constructor(props: PostprocessorProps) {
    super(props);
    this._canvas = props.canvas;
    this._canvasHandler = new CanvasHandler({ canvasRef: props.canvas });
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
   * Crops the image to the predetermined scanning area
   * and returns the new size in bytes.
   *
   * Currently not in use as we are directly cropping after capture, but it may
   * be necessary to split the operations later.
   */
  protected async crop(cropInstructions: DOMRect): Promise<Number> {
    const bitmap = await createImageBitmap(this._capture);
    const params: DrawImageParameters = {
      sx: cropInstructions.x,
      sy: cropInstructions.y,
      sHeight: cropInstructions.height,
      sWidth: cropInstructions.width,
      dx: cropInstructions.x,
      dy: cropInstructions.y,
      dHeight: cropInstructions.height,
      dWidth: cropInstructions.width
    };
    const croppedBlob = await this._canvasHandler.draw(bitmap, params);
    this.logImageStats(croppedBlob, 'Photo capture after downscaling.');
    this._capture = croppedBlob;
    return croppedBlob.size;
  }

  /**
   * Downscales the image by a factor of 0.5 and returns the new size.
   */
  protected async scale(scaleInstructions: DOMRect) {
    const bitmap = await createImageBitmap(this._capture);
    const params: DrawImageParameters = {
      sx: 0,
      sy: 0,
      sHeight: scaleInstructions.height,
      sWidth: scaleInstructions.width,
      dx: 0,
      dy: 0,
      dHeight: scaleInstructions.height * 0.5,
      dWidth: scaleInstructions.width * 0.5
    };
    this._canvas.current.width = scaleInstructions.width * 0.5;
    this._canvas.current.height = scaleInstructions.height * 0.5;
    const downscaledBlob = await this._canvasHandler.draw(bitmap, params);
    this.logImageStats(downscaledBlob, 'Photo capture after downscaling.');
    this._capture = downscaledBlob;
    return downscaledBlob.size;
  }

  /**
   * Recolours the image to black and white and returns the size of the new image.
   */
  protected async blackAndWhite(): Promise<Number> {
    const imgData = await this._canvasHandler.getCanvasContents();

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
    this.logImageStats(
      bwImgBlob,
      'Photo capture after black and white recolour.'
    );
    this._capture = bwImgBlob;
    return bwImgBlob.size;
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
