async function getCapabilities(): Promise<void> {
  try {
    const mediaCapabilities = await navigator.mediaDevices.getUserMedia({
      video: true
    });
    const browserContraints = navigator.mediaDevices.getSupportedConstraints();
    console.group('browser and device capabilities');
    console.info('Device video', mediaCapabilities);
    console.info('Browser capabilities', browserContraints);
    console.groupEnd();
  } catch (error) {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'AbortError':
        case 'NotAllowedError':
        case 'NotFoundError':
        case 'NotReadableError':
        case 'OverconstrainedError':
        case 'SecurityError':
        case 'TypeError':
          // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
          console.error(error.message);
        default:
          console.error('Some other error occured', error);
      }
    }
  }
}

export { getCapabilities };
