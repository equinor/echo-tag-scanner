/**
 * Logs device and browser capabilities.
 */
async function getCapabilities(): Promise<boolean> {
  const mediaCapabilities = await navigator.mediaDevices.getUserMedia({
    video: true
  });
  const browserContraints = navigator.mediaDevices.getSupportedConstraints();
  console.group('browser and device capabilities');
  console.info('Device video', mediaCapabilities);
  console.info('Browser capabilities', browserContraints);
  console.groupEnd();
  return true;
}

function getCapabilitiesRaw(): boolean {
  navigator.mediaDevices.getUserMedia({ video: true }).then((mediaCapabilities) => {
    const browserContraints = navigator.mediaDevices.getSupportedConstraints();
    console.group('browser and device capabilities');
    console.info('Device video', mediaCapabilities);
    console.info('Browser capabilities', browserContraints);
    console.groupEnd();
    return false;
  });

  return false;
}

export { getCapabilities, getCapabilitiesRaw };
