import {
  CameraResolution,
  CustomNotificationDetail,
  ZoomEventDetail,
  NewCaptureEventDetail
} from '@types';

/** CustomEvent cannot be type inferred from Event. This will instead type guard it. */
export function isCustomEvent<T>(event: Event): event is CustomEvent<T> {
  return (event as CustomEvent).detail != undefined;
}

/** Accepts a generic Event object and infers it to CustomEvent<CameraResolution> if the event object contains a width and height. */
export function isCustomResolutionEvent(
  event: Event
): event is CustomEvent<CameraResolution> {
  if (
    isCustomEvent(event) &&
    event.detail != null &&
    typeof event.detail === 'object'
  ) {
    return (
      Reflect.has(event.detail, 'height') && Reflect.has(event.detail, 'width')
    );
  }

  return false;
}

export function isCustomNotificationDetail(
  detail: unknown
): detail is CustomNotificationDetail {
  if (detail != null && typeof detail === 'object') {
    return (
      Reflect.has(detail, 'message') && Reflect.has(detail, 'autohideDuration')
    );
  }
  return false;
}

export function isCustomZoomEvent(
  event: Event
): event is CustomEvent<ZoomEventDetail> {
  if (
    isCustomEvent(event) &&
    event.detail != null &&
    typeof event.detail === 'object'
  ) {
    return (
      Reflect.has(event.detail, 'zoomFactor') &&
      Reflect.has(event.detail, 'type')
    );
  }

  return false;
}

export function isNewCaptureEvent(
  event: Event
): event is CustomEvent<NewCaptureEventDetail> {
  if (
    isCustomEvent(event) &&
    event.detail != null &&
    typeof event.detail === 'object'
  ) {
    if ('url' in event.detail && 'size' in event.detail) {
      if (typeof event.detail.url === 'string' && event.detail.url.length > 0) {
        if (typeof event.detail.size === 'number') {
          return true;
        }
      }
    }
  }
  return false;
}