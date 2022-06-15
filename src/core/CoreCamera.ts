import { RefObject } from 'react';
import { handleError } from '@utils';
import { ErrorRegistry } from '@enums';

export interface CameraProps {
  viewfinder: RefObject<HTMLVideoElement>;
  canvas?: RefObject<HTMLCanvasElement>;
  additionalCaptureOptions?: DisplayMediaStreamConstraints;
}

class CoreCamera {
  protected _cameraEnabled = true;
  protected _mediaStream?: MediaStream;
  protected _viewfinder?: RefObject<HTMLVideoElement>;
  protected _videoTrack?: MediaStreamTrack;
  public _capabilities?: MediaTrackCapabilities = undefined;
  protected _settings?: MediaTrackSettings;

  constructor(props: CameraProps) {
    this._viewfinder = props.viewfinder;

    // Request camera usage.
    this.promptCameraUsage(props.additionalCaptureOptions).then(
      onApproval.bind(this),
      onRejection
    );

    function onApproval(mediaStream: MediaStream) {
      this._mediaStream = mediaStream;
      this._videoTrack = this._mediaStream.getVideoTracks()[0];
      this._capabilities = this._videoTrack.getCapabilities();
      this._settings = this.videoTrack?.getSettings();
      if (this._viewfinder?.current) {
        this._viewfinder.current.srcObject = mediaStream;
      }

      console.group('Camera capabilities');
      console.info(
        'Camera is capable of zooming: ',
        Boolean(this._capabilities.zoom)
      );
      console.info(
        'Camera is capable of using the torch: ',
        Boolean(this._capabilities.torch)
      );
      console.groupEnd();
    }

    function onRejection(reason: unknown) {
      console.info('Camera usage was rejected.');
      console.error(reason);
    }
  }

  private async promptCameraUsage(
    additionalCaptureOptions?: DisplayMediaStreamConstraints
  ) {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: {
            min: globalThis.innerWidth,
            ideal: globalThis.innerWidth,
            max: globalThis.innerWidth
          },
          height: {
            min: globalThis.innerHeight,
            ideal: globalThis.innerHeight,
            max: globalThis.innerHeight
          },
          frameRate: {
            ideal: 30,
            min: 15
          },
          facingMode: 'environment'
        },
        audio: false,
        ...additionalCaptureOptions
      });
      return mediaStream;
    } catch (error) {
      throw new Error(error);
    }
  }

  public get cameraEnabled(): boolean {
    return this._cameraEnabled;
  }

  public get videoTrack(): MediaStreamTrack | undefined {
    return this._videoTrack;
  }

  public get capabilities(): MediaTrackCapabilities | undefined {
    return this._capabilities;
  }

  public get settings(): MediaTrackSettings | undefined {
    return this._settings;
  }

  public zoom(zoomValue: number): void {
    if (this._capabilities?.zoom) {
      this._videoTrack
        ?.applyConstraints({ advanced: [{ zoom: zoomValue }] })
        .catch(onZoomRejection);
    }

    function onZoomRejection(reason: unknown) {
      throw handleError(
        ErrorRegistry.zoomError,
        new Error('A zoom action failed, more info: ' + reason)
      );
    }
  }

  protected torch(toggled: boolean): void {
    if (this._capabilities?.torch) {
      this._videoTrack
        ?.applyConstraints({ advanced: [{ torch: toggled }] })
        .catch(onTorchRejection);
    } else {
      console.warn('Device does not support the torch');
    }

    function onTorchRejection(reason: unknown) {
      throw handleError(
        ErrorRegistry.torchError,
        new Error('The torch could not be toggled, more info: ' + reason)
      );
    }
  }

  public stopCamera() {
    if (this._videoTrack) {
      this._videoTrack.stop();
    }
  }
}

export { CoreCamera };
