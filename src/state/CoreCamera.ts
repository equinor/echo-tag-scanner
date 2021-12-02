import { RefObject } from 'react';
import { handleError } from '@utils';
import { ErrorRegistry } from '@enums';

export interface CoreCameraProps {
  viewfinder: RefObject<HTMLVideoElement>;
  additionalCaptureOptions?: DisplayMediaStreamConstraints;
}

class CoreCamera {
  private _cameraEnabled = true;
  private _capture: Blob[] = [];
  private _mediaStream?: MediaStream;
  private _canvas?: RefObject<HTMLCanvasElement>;
  private _viewfinder?: RefObject<HTMLVideoElement>;
  private _videoTrack?: MediaStreamTrack;
  public _capabilities?: MediaTrackCapabilities = undefined;
  private _settings?: MediaTrackSettings;

  constructor(props: CoreCameraProps) {
    this._viewfinder = props.viewfinder;
    this.enableStream(props.additionalCaptureOptions);

    if (this._mediaStream) {
      this._videoTrack = this._mediaStream.getVideoTracks()[0];

      if (this._videoTrack) {
        this._capabilities = this._videoTrack.getCapabilities();
        this._settings = this.videoTrack?.getSettings();
      }
    }
  }

  public get cameraEnabled(): boolean {
    return this._cameraEnabled;
  }

  public get capture(): Blob[] {
    return this._capture;
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

  protected zoom(zoomValue: number): void {
    // TODO: Error handling

    if (this._capabilities?.zoom) {
      this._videoTrack
        ?.applyConstraints({ advanced: [{ zoom: zoomValue }] })
        .catch(onZoomRejection);
    } else {
      // TODO: refactor to informational
      console.warn('Device is not zoom capable');
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
        ErrorRegistry.zoomError,
        new Error('The torch could not be toggled, more info: ' + reason)
      );
    }
  }

  public async capturePhoto(): Promise<Blob | undefined> {
    const videoTracks = this._mediaStream?.getVideoTracks();

    if (Array.isArray(videoTracks) && videoTracks.length === 1) {
      // Browser supports ImageCapture
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (globalThis.ImageCapture) {
        return await capture(videoTracks[0]);
      } else {
        // use legacy frame capture
        legacyCapture.call(this);
      }
    }

    async function capture(videoTrack: MediaStreamTrack) {
      const capture = new ImageCapture(videoTrack);
      return await capture.takePhoto();
    }

    /**
     * @this {CoreCamera}
     */
    async function legacyCapture() {
      console.info('legacy capture', this);
    }
  }

  /**
   * Enables the viewfinder on a video element.
   * @param additionalCaptureOptions video track options.
   */
  private async enableStream(
    additionalCaptureOptions?: DisplayMediaStreamConstraints
  ): Promise<void> {
    if (this._viewfinder?.current) {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        ...additionalCaptureOptions
      });
      this._mediaStream = mediaStream;
      this._viewfinder.current.srcObject = mediaStream;
    }
  }
}

export { CoreCamera };
