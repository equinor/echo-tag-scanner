import { CustomEventDetail, Dimensions } from '@types';

/**
 * Returns a dispatch closure for sending notifications to the user.
 * @param customEventDetail The message for the user.
 * @param trigger The triggering element. If undefined, the event is dispatched by globalThis.
 */
function getNotificationDispatcher(
  customEventDetail: string | CustomEventDetail,
  trigger?: HTMLElement
) {
  return function dispatch(): boolean {
    // Throw a notification on the triggering element.
    if (trigger instanceof HTMLElement) {
      return trigger.dispatchEvent(
        new CustomEvent<CustomEventDetail | string>('notification', {
          detail: customEventDetail,
          bubbles: true
        })
      );
    } else {
      // Throw a notification in the global scope.
      return globalThis.dispatchEvent(
        new CustomEvent<CustomEventDetail | string>('notification', {
          detail: customEventDetail,
          bubbles: true
        })
      );
    }
  };
}

export { getNotificationDispatcher };
