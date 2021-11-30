import { getNotificationDispatcher } from '@utils';

const mockedTagNumbers = ['63JA001', 'tagnumber123', ''];

async function doScanning(): Promise<string | undefined> {
  const response = await apiFetch();
  const inspectionResult = inspectApiResult(response);

  if (inspectionResult) {
    getNotificationDispatcher('Found ' + response)();
  } else {
    return undefined;
  }
}

function inspectApiResult(result: string): boolean {
  // Inspect the tag number here
  if (result) {
    return true;
  } else {
    return false;
  }
}

async function apiFetch(): Promise<string> {
  // Do API fetch here, waiting and stuffs.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockedTagNumbers[0]);
    }, 1000);
  });
}

function apiRejection(reason: unknown) {
  // Handle errors here, 404, 502 and stuffs.
  // Use notification or let the issue go unhandled to make ErrorBoundary do the work.
}

export { doScanning };
