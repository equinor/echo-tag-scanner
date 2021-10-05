import React, { useState, useEffect, useCallback } from 'react';
import { CapturePreviewerItem } from '../capturePreviewer/CapturePreviewer';
import { ExtendedMediaTrackCapabilities, ExtendedMediaTrackSettings } from '@types';

type State = {
  cameraMode: 'video' | 'photo';
  recordingStatus: boolean;
  recordingPaused: boolean;
  mediaCaptures: File[];
  mediaPreviews: CapturePreviewerItem[];
  showCarousel: boolean;
  showSelect: boolean;
  mediaStream: MediaStream | null;
  isUploading: boolean;
  file?: File;
  mediaRecorder: null | MediaRecorder;
  mediaAvailable?: boolean;
  torchEnabled: boolean;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const useCameraState = (
  video: React.RefObject<HTMLVideoElement>,
  canvas: React.RefObject<HTMLCanvasElement>,
  input: React.RefObject<HTMLInputElement>
) => {
  let chunks: Blob[] = [];
  const [state, setState] = useState<State>({
    cameraMode: 'photo',
    recordingStatus: false,
    recordingPaused: false,
    mediaCaptures: [],
    mediaPreviews: [],
    isUploading: false,
    file: undefined,
    showCarousel: false,
    showSelect: false,
    mediaRecorder: null,
    mediaStream: null,
    torchEnabled: false
  });

  useEffect(() => {
    if (!state.recordingStatus && state.mediaStream === null) {
      getStream();
    }
    // Settings to capture video from webcam
    if (state.mediaRecorder) {
      // here the streams are pushed to an array to later be used
      state.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      // here once recording is stopped, the recording will be saved and converted to a FILE type and stored in state.
      // and the recording URL will be set to a second video elemnt so the user can review what he/she captured.
      if (state.mediaRecorder) {
        state.mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'video/mp4' });
          const videoFile = new File([blob], `videoCapture${state.mediaCaptures.length + 1}.mp4`, {
            type: 'video/mp4'
          });

          // TODO: address this potential rerender issue.
          // eslint-disable-next-line react-hooks/exhaustive-deps
          chunks = [];
          // const videoURL = window.URL.createObjectURL(blobs);
          const files = [...state.mediaCaptures];
          const mediaPreviews = [...state.mediaPreviews];
          files.push(videoFile);
          const preview = URL.createObjectURL(videoFile);
          const revokeOperation = function revoke(preview: string) {
            (URL || webkitURL).revokeObjectURL(preview);
          };
          mediaPreviews.push({
            objectUrl: preview,
            revoke: revokeOperation,
            type: 'video'
          });
          setState((prevState) => ({
            ...prevState,
            mediaCaptures: files,
            mediaPreviews: mediaPreviews,
            recordingStatus: false
          }));
        };
      }
    }
    if (state.mediaStream) {
      sleep(1000); // this is for allowZoom to be intialized properly.
      allowZoom(state.mediaStream);
    }
  }, [state.recordingStatus, state.mediaStream]);

  async function getStream(newConstraints?: MediaStreamConstraints) {
    let stream: MediaStream;
    const settings = newConstraints ?? {
      video: { facingMode: 'environment' }
    };
    const usermedia = await navigator.mediaDevices.getUserMedia(settings);
    await setContraints(usermedia);

    async function setContraints(mediaStream: MediaStream) {
      stream = mediaStream;
      setMedia(stream, { videoBitsPerSecond: 3000000 });
    }
  }

  const toggleTorch = () => {
    console.info('turning on torch');
    if (state.mediaStream) {
      const track = state.mediaStream.getTracks()[0];
      const constraints = track.getConstraints();
      track
        .applyConstraints({
          ...constraints,

          // torch is not typed in MediaContraintsSet for some reason.
          //@ts-expect-errorts-ignore
          advanced: [{ torch: !state.torchEnabled }]
        })
        .then(() => {
          setState((prevState) => ({
            ...prevState,
            torchEnabled: !state.torchEnabled
          }));
        })
        .catch(() => {
          console.info('Your device does not support the torch functionality.');
        });
    }
  };

  const setMedia = (stream: MediaStream, options: MediaRecorderOptions) => {
    // we create a new instance of the current stream as MediaRecorder and make it available through saving it in state.
    const mediaRecorder = new MediaRecorder(stream, options);
    return setState({
      ...state,
      mediaRecorder: mediaRecorder,
      mediaStream: stream
    });
  };

  const videoActions = (action: string) => {
    switch (action) {
      case 'take': {
        if (!state.recordingStatus) {
          state.mediaRecorder?.start();
          return setState((prevState) => ({
            ...prevState,
            recordingStatus: true
          }));
        } else if (state.recordingPaused) {
          state.mediaRecorder?.resume();
          return setState((prevState) => ({
            ...prevState,
            recordingPaused: false
          }));
        } else {
          state.mediaRecorder?.pause();
          return setState((prevState) => ({
            ...prevState,
            recordingPaused: true
          }));
        }
      }
      case 'stop': {
        return state.mediaRecorder?.stop();
      }
    }
  };

  const photoAction = () => {
    const tracks = state.mediaStream?.getTracks();
    if (Array.isArray(tracks) && tracks.length > 0) {
      const { height, width } = tracks[0].getSettings();
      if (canvas?.current && video?.current && canvas.current.getContext && width && height) {
        canvas.current.width = width ?? 1;
        canvas.current.height = height ?? 1;
        canvas.current?.getContext('2d')?.drawImage(video?.current, 0, 0, width, height);

        canvas.current?.toBlob(async (blob) => {
          //image from canvas is converted to a file and then set to state.
          const files = [...state.mediaCaptures];
          const mediaPreviews = [...state.mediaPreviews];
          let file: File;
          if (blob) {
            file = new File([blob], `capture${state.mediaCaptures.length + 1}.JPEG`, {
              type: 'image/jpeg'
            });
            files.push(file);
            const preview = URL.createObjectURL(file);
            const revokeOperation = function revoke(preview: string) {
              URL.revokeObjectURL(preview);
            };
            mediaPreviews.push({
              objectUrl: preview,
              revoke: revokeOperation,
              type: 'image'
            });
          }
          setState((prevState) => ({
            ...prevState,
            mediaCaptures: files,
            mediaPreviews: mediaPreviews,
            recordingStatus: false
          }));
        });
      }
    }
  };

  const toggleCarousel = () => {
    return setState((prevState) => ({
      ...prevState,
      showCarousel: !prevState.showCarousel
    }));
  };
  const toggleCameraMode = () => {
    if (state.recordingStatus) {
      return;
    } else {
      state.cameraMode === 'video'
        ? setState((prevState) => ({
            ...prevState,
            cameraMode: 'photo'
          }))
        : setState((prevState) => ({
            ...prevState,
            cameraMode: 'video'
          }));
    }
  };
  const sleep = (ms = 0) => new Promise((r) => setTimeout(r, ms));
  const allowZoom = (mediaStream: MediaStream) => {
    const track = mediaStream.getVideoTracks()[0];
    const capabilities: ExtendedMediaTrackCapabilities = track.getCapabilities();
    console.log('%c⧭', 'color: #731d1d', capabilities);
    const settings: ExtendedMediaTrackSettings = track.getSettings();
    console.log('%c⧭', 'color: #807160', settings);
    const { current: zoomInput } = input;

    if (!('zoom' in capabilities) && zoomInput) {
      // zoomInput.style.background = 'black';
    } else {
      if (zoomInput) {
        zoomInput.min = assignZoomSettings('min');
        zoomInput.max = assignZoomSettings('max');
        zoomInput.step = assignZoomSettings('step');
        zoomInput.value = assignZoomSettings('value');
        zoomInput.oninput = (e) => {
          console.log(e);
          track
            .applyConstraints({
              // torch is not typed in MediaContraintsSet for some reason.
              //@ts-expect-errorts-ignore
              advanced: [{ zoom: e.target.value }]
            })
            .catch((error) => {
              console.info('Your device does not support zoom.');
              console.error(error);
            });
        };
        zoomInput.hidden = false;
      }
    }

    /**
     * Returns a string representation of zoom capabilities.
     * @param type The property of capability.zoom
     */
    function assignZoomSettings(type: 'min' | 'max' | 'step' | 'value'): string {
      if (type === 'value') {
        if (settings.zoom) {
          return String(settings.zoom);
        } else {
          return '1';
        }
      }
      if (capabilities.zoom) {
        if (capabilities.zoom[type]) {
          return String(capabilities.zoom[type]);
        }
      }
      // If zoom capabilities does not exist, we need to return a stringified zero
      // to prevent "undefined" to be assigned to the zoom slider.
      return '0';
    }
  };

  const deleteMedia = (deleteIndex: number) => {
    const newMediaPreviews = (function deleteMediaPreview() {
      if (state.mediaPreviews.length <= 1) {
        return [];
      }
      const copy = state.mediaPreviews.map((preview) => preview);
      const deletedPreview = copy.splice(deleteIndex, 1)[0];
      deletedPreview.revoke(deletedPreview.objectUrl);
      return copy;
    })();

    const newMediaCaptures = (function deleteMediaCapture() {
      if (state.mediaCaptures.length <= 1) {
        return [];
      }
      const copy = state.mediaCaptures.map((preview) => preview);
      copy.splice(deleteIndex, 1);
      return copy;
    })();

    setState((prevState) => ({
      ...prevState,
      mediaPreviews: newMediaPreviews,
      mediaCaptures: newMediaCaptures
    }));
  };

  const toggleSelectCamera = () => {
    return setState((prevState) => ({
      ...prevState,
      showSelect: !prevState.showSelect
    }));
  };

  const getCameraDimensions = () => {
    if (state.mediaStream) {
      const track = state.mediaStream.getTracks();
      if (Array.isArray(track) && track.length > 0) {
        const settings = track[0].getSettings();
        return { width: settings.width, height: settings.height };
      }
    }
  };

  const turnCameraOff = useCallback(() => {
    if (state.mediaStream) {
      state.mediaStream.getTracks().map((track) => track.stop());
    }

    state.mediaPreviews.forEach(function revokeObjectUrls(preview) {
      if (preview.objectUrl) {
        (URL || webkitURL).revokeObjectURL(preview.objectUrl);
      }
    });
  }, [state.mediaStream]);

  return {
    state,
    toggleCameraMode,
    toggleCarousel,
    toggleSelectCamera,
    videoActions,
    photoAction,
    turnCameraOff,
    deleteMedia,
    toggleTorch,
    getCameraDimensions
  };
};

export { useCameraState };
