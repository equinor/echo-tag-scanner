import React, { useState, useEffect, useCallback } from 'react';
import { useDeviceType } from '@hooks';
import { CapturePreviewerItem } from './capturePreviewer/CapturePreviewer';

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
const UseCameraState = (
  video: React.RefObject<HTMLVideoElement>,
  canvas: React.RefObject<HTMLCanvasElement>,
  input: React.RefObject<HTMLInputElement>,
  select: React.RefObject<HTMLSelectElement>,
  close: () => void
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
  const [deviceType] = useDeviceType();

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

  const getStream = (newConstraints?: MediaStreamConstraints) => {
    let stream: MediaStream;
    const settings = newConstraints ?? {
      video: { facingMode: 'environment' }
    };
    navigator.mediaDevices
      .getUserMedia(settings)
      .then(async (mediaStream) => {
        stream = mediaStream;
        await setOptimalConstraints(mediaStream);
        setMedia(stream, { videoBitsPerSecond: 3000000 });
        return navigator.mediaDevices.enumerateDevices();
      })
      .then((devices) => getCameraSelection(devices, stream))
      .catch((e) => {
        console.error(e.toString());
      });
  };

  const getCameraSelection = (devices: MediaDeviceInfo[], stream: MediaStream) => {
    const { current: selectElement } = select;
    const currentDevice = stream.getTracks()[0].label;

    const videoDevices =
      deviceType === 'mobile'
        ? devices.filter(
            (device) =>
              device.kind === 'videoinput' && device.label.toLowerCase().indexOf('back') !== -1
          )
        : devices.filter((device) => device.kind === 'videoinput');

    if (selectElement !== null && selectElement.childElementCount === 0) {
      // sets device options
      if (videoDevices.length === 1) {
        return console.info('dont show select');
      }
      const options: HTMLOptionElement[] = [];
      videoDevices.map((videoDevice) => {
        const option = document.createElement('option');
        option.value = videoDevice.deviceId;
        option.label = videoDevice.label;
        if (videoDevice.label === currentDevice) {
          options.unshift(option);
        } else {
          options.push(option);
        }
      });
      selectElement.style.display = 'block';
      return options.map((option) => selectElement.appendChild(option));
    }
  };

  const toggleTorch = () => {
    if (state.mediaStream) {
      const track = state.mediaStream.getTracks()[0];
      const constraints = track.getConstraints();
      track
        .applyConstraints({
          ...constraints,
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

  const setOptimalConstraints = (mediaStream: MediaStream) => {
    const track = mediaStream.getTracks()[0];
    const constraints = track.getConstraints();
    const { height, width } = track.getConstraints();
    let update;

    if (deviceType === 'mobile') {
      update = {
        ...constraints,
        width: { min: width, max: width },
        height: { min: height, max: height }
      };
    } else if (deviceType === 'tablet') {
      update = {
        ...constraints,
        width: { min: width, max: width },
        height: { min: height, max: height }
      };
    } else {
      update = {
        ...constraints,
        width: { min: width, max: width },
        height: { min: height, max: height }
      };
    }
    return track.applyConstraints(update).catch((error) => {
      console.info('Something went wrong when we tried to set contraints.');
      console.error(error);
    });
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
        canvas.current?.getContext('2d').drawImage(video?.current, 0, 0, width, height);

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
    const capabilities = track.getCapabilities();
    const settings = track.getSettings();
    const { current: zoomInput } = input;

    if (!('zoom' in capabilities) && zoomInput) {
      return;
    } else {
      if (zoomInput) {
        zoomInput.min = capabilities?.zoom?.min;
        zoomInput.max = capabilities?.zoom?.max;
        zoomInput.step = capabilities?.zoom?.step;
        zoomInput.value = settings?.zoom;
        zoomInput.oninput = (e) => {
          track
            .applyConstraints({
              advanced: [{ zoom: e.target.value }]
            })
            .catch((error) => {
              console.info('Your device does not support zoom.');
              console.error(error);
            });
        };
        zoomInput.hidden = false;
        zoomInput.style.display = 'block';
      }
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

    close();
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

export default UseCameraState;
