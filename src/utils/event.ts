import {
  CameraResolution,
  CustomNotificationDetail,
  ZoomEventDetail
} from '@types';

/**
 * Returns a dispatch closure for sending notifications to the user.
 * @param customEventDetail The message for the user.
 * @param trigger The triggering element. If undefined, the event is dispatched by globalThis.
 */
function getNotificationDispatcher(
  customEventDetail: string | CustomNotificationDetail,
  trigger?: HTMLElement
) {
  return function dispatch(): boolean {
    // Throw a notification on the triggering element.
    if (trigger instanceof HTMLElement) {
      return trigger.dispatchEvent(
        new CustomEvent<CustomNotificationDetail | string>('notification', {
          detail: customEventDetail,
          bubbles: true
        })
      );
    } else {
      // Throw a notification in the global scope.
      return globalThis.dispatchEvent(
        new CustomEvent<CustomNotificationDetail | string>('notification', {
          detail: customEventDetail,
          bubbles: true
        })
      );
    }
  };
}

export function dispatchCameraResolutionEvent(payload: CameraResolution) {
  const resolutionEvent = new CustomEvent('camera-resolution', {
    detail: payload
  });
  globalThis.dispatchEvent(resolutionEvent);
}
export function dispatchZoomEvent(payload: ZoomEventDetail) {
  const simulatedZoomEvent = new CustomEvent('camera-zoom', {
    detail: payload
  });
  globalThis.dispatchEvent(simulatedZoomEvent);
}

export { getNotificationDispatcher };
