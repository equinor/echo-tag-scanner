import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Toast } from '@ui';
import { CustomEventDetail } from '@types';
import { isCustomEvent } from '@utils';
/**
 * A top level element that displays an EDS Snackbar if it detects the custom event "notification"
 */
const NotificationHandler: FC = () => {
  const [currentEvent, setCurrentEvent] = useState<
    string | CustomEventDetail | undefined
  >(undefined);
  useEffect(function mountNotificationHandler() {
    // No need to check for duplicate event listeners as long as the
    // listener function is not anonymous.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#multiple_identical_event_listeners
    globalThis.addEventListener('notification', updateToastMessage);

    return () =>
      globalThis.removeEventListener('notification', updateToastMessage);

    function updateToastMessage(event: Event) {
      //TODO: improve this by checking the event.detail for the required properties.
      if (isCustomEvent<CustomEventDetail>(event)) {
        if (event.detail) {
          setCurrentEvent(event.detail);
        } else {
          setCurrentEvent(undefined);
        }
      }
    }
  }, []);

  function isCustomDetail(event: unknown): event is CustomEventDetail {
    if (event != null && typeof event === 'object') {
      return (
        Reflect.has(event, 'autohideDuration') && Reflect.has(event, 'message')
      );
    }
    return false;
  }

  if (typeof currentEvent === 'string') {
    return (
      <Notification
        open
        message={currentEvent}
        onClose={() => setCurrentEvent(undefined)}
      />
    );
  } else if (isCustomDetail(currentEvent)) {
    return (
      <Notification
        open
        message={currentEvent.message}
        autoHideDuration={currentEvent.autohideDuration}
        onClose={() => setCurrentEvent(undefined)}
      />
    );
  } else {
    return <div id="unfired_notification" />;
  }
};

const Notification = styled(Toast)`
  position: absolute !important;
  bottom: 25% !important;
  left: 50% !important;
`;

export { NotificationHandler };
