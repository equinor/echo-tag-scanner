/**
 * Returns a dispatch closure for sending notifications to the user.
 * @param message The message for the user.
 * @param trigger The triggering element. If undefined, the event is dispatched by globalThis.
 */
function getNotificationDispatcher(message: string, trigger?: HTMLElement) {
  return function dispatch(): boolean {
    if (trigger instanceof HTMLElement) {
      if (typeof message === 'string' && message !== '') {
        return trigger.dispatchEvent(
          new CustomEvent('notification', { detail: message, bubbles: true })
        );
      }
    } else {
      return globalThis.dispatchEvent(
        new CustomEvent('notification', { detail: message, bubbles: true })
      );
    }
    return false;
  };
}

export { getNotificationDispatcher };
