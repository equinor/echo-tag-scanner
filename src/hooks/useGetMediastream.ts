import { useState } from "react";
import { TagScanner } from "@cameraLogic";
import EchoUtils from "@equinor/echo-utils";
import { logger } from "@utils";

type RequestStatus = "requesting" | "not allowed" | "allowed";

type Payload = {
  mediaStream?: MediaStream;
  mediaStreamRequestError?: Error;
  requestStatus: RequestStatus;
};

export function useGetMediastream(): Payload {
  const [mediaStream, setStream] = useState<MediaStream | undefined>();
  const [mediaStreamRequestError, setError] = useState<
    Error | undefined
  >();
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    "requesting",
  );

  EchoUtils.Hooks.useEffectAsync(async () => {
    try {
      const mediaStream = await TagScanner.getMediastream();
      setStream(mediaStream);
      setRequestStatus("allowed");
    } catch (cameraRequestError) {
      if (cameraRequestError instanceof Error) {
        setError(cameraRequestError);
        setRequestStatus("not allowed");
        logger.trackError(cameraRequestError);
      }
    }
  }, []);
  return { mediaStream, mediaStreamRequestError, requestStatus };
}
