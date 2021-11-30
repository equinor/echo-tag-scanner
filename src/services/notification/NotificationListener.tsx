import React from 'react';
import { FC, useEffect, useState } from 'react';
import { Toast } from '../../components';
import styles from './styles.less';
/**
 * A top level element that displays an EDS Snackbar if it detects the custom event "notification"
 */
const NotificationHandler: FC = () => {
  const [message, setMessage] = useState<string | undefined>(undefined);
  useEffect(function mountNotificationHandler() {
    // No need to check for duplicate event listeners as long as the
    // listener function is not anonymous.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#multiple_identical_event_listeners
    globalThis.addEventListener('notification', updateToastMessage);

    return () => globalThis.removeEventListener('notification', updateToastMessage);

    function updateToastMessage(event: Event) {
      if (isCustomEvent(event)) {
        if (typeof event.detail === 'string') {
          setMessage(event.detail);
        } else {
          setMessage(undefined);
        }
      }
    }
  }, []);

  /** CustomEvent cannot be type inferred from Event. This will instead type guard it. */
  function isCustomEvent(event: Event): event is CustomEvent {
    return (event as CustomEvent).detail != undefined;
  }

  if (message) {
    return (
      <Toast
        className={styles.notification}
        open
        message={message}
        onClose={() => setMessage(undefined)}
      />
    );
  } else {
    return <div id="unfired_notification" />;
  }
};

export { NotificationHandler };
