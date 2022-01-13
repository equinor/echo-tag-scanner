import { RefObject } from 'react';
import { handleError } from '@utils';
import { ErrorRegistry } from '@enums';

export interface CoreCameraProps {
  viewfinder: RefObject<HTMLVideoElement>;
  canvas: RefObject<HTMLCanvasElement>;
  additionalCaptureOptions?: DisplayMediaStreamConstraints;
}

class CoreCamera {
  private _cameraEnabled = true;
  private _capture?: Blob;
  private _mediaStream?: MediaStream;
  private _canvas?: RefObject<HTMLCanvasElement>;
  protected _viewfinder?: RefObject<HTMLVideoElement>;
  private _videoTrack?: MediaStreamTrack;
  public _capabilities?: MediaTrackCapabilities = undefined;
  private _settings?: MediaTrackSettings;

  constructor(props: CoreCameraProps) {
    this._viewfinder = props.viewfinder;
    this._canvas = props.canvas;

    // Request camera usage.
    this.promptCameraUsage(props.additionalCaptureOptions).then(
      onApproval.bind(this),
      onRejection
    );

    function onApproval(mediaStream: MediaStream) {
      console.info('Camera usage was approved');
      this._mediaStream = mediaStream;
      this._videoTrack = this._mediaStream.getVideoTracks()[0];
      this._capabilities = this._videoTrack.getCapabilities();
      this._settings = this.videoTrack?.getSettings();
      if (this._viewfinder?.current) {
        this._viewfinder.current.srcObject = mediaStream;
      }
    }

    function onRejection(reason: unknown) {
      console.info('Camera usage was rejected.');
      console.error(reason);
    }
  }

  private async promptCameraUsage(
    additionalCaptureOptions?: DisplayMediaStreamConstraints
  ) {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
      ...additionalCaptureOptions
    });

    return mediaStream;
  }

  public get cameraEnabled(): boolean {
    return this._cameraEnabled;
  }

  public get capture(): Blob | undefined {
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
        ErrorRegistry.zoomError,
        new Error('The torch could not be toggled, more info: ' + reason)
      );
    }
  }

  public async stopCamera() {
    if (this._videoTrack) {
      this._videoTrack.stop();
    }
  }

  protected async capturePhoto(): Promise<void> {
    const videoTracks = this._mediaStream?.getVideoTracks();

    function handleLegacyCaptureError(error) {
      console.warn("Something bad happened with legacy canvas frame capture.");
      console.error(error)
    }
    if (Array.isArray(videoTracks) && videoTracks.length === 1) {
      if (ImageCapture) {
        this._capture = await capture(videoTracks[0]);
      } else {
        // use legacy frame capture
        await legacyCapture
          .call(this)
          .then((stillFrame: Blob) => {
            console.info('captured frame', stillFrame);
            this._capture = stillFrame;
          })
          .catch(handleLegacyCaptureError);
      }

    }

    async function capture(videoTrack: MediaStreamTrack) {
      const capture = new ImageCapture(videoTrack);
      return await capture.takePhoto();
    }

    /**
     * Captures a photo for browsers that does not support ImageCapture.
     * @this CoreCamera
     */
    async function legacyCapture(): Promise<Blob | undefined> {
      // Captures a frame from the viewfinder and stores it in a hidden canvas.
      const writeViewfinderToCanvas = () => {
        return new Promise((resolve, reject) => {
          if (this._canvas?.current != null) {
            const settings = this._videoTrack?.getSettings();
            if (settings) {
              if (
                typeof settings.height === 'number' &&
                typeof settings.width === 'number'
              ) {
                this._canvas.current.width = settings.width;
                this._canvas.current.height = settings.height;
                const canvasContext = this._canvas.current.getContext('2d');

                if (canvasContext && this._viewfinder?.current != null) {
                  canvasContext.drawImage(
                    this._viewfinder?.current,
                    0,
                    0,
                    settings.width,
                    settings.height
                  );
                  resolve(undefined);
                }
              }
            }
          } else {
            reject('Could not find a canvas to capture a frame to.');
          }
        });
      };

      // Retrieve the current contents of the hidden canvas as a Blob.
      const getBlob = (): Promise<Blob | undefined> => {
        return new Promise((resolve) => {
          if (this._canvas.current != null) {
            this._canvas.current.toBlob((blob: Blob) => {
              resolve(blob);
            });
          }
        });
      };

      await writeViewfinderToCanvas();
      return await getBlob();
    }
  }
}

export { CoreCamera };
