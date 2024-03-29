import React from 'react';
import styled from 'styled-components';
import {
  getNotificationDispatcher as dispatchNotification,
  isDevelopment,
  isLocalDevelopment
} from '@utils';
import { zIndexes } from '../../const';

interface SystemInfoTriggerProps {
  getContentsForClipboard: () => Promise<string>;
}

const SystemInfoTrigger = (props: SystemInfoTriggerProps) => {
  async function onTriggerSystemInfo() {
    try {
      // Workaround for allowing Safari to asynchronously write data to the system clipboard.
      const clip = new ClipboardItem({
        'text/plain':
          // Call this function to get the textual content.
          props
            .getContentsForClipboard()

            // Then resolve a Blob construct with the text payload and of the same MIME type.
            .then((text) => new Blob([text], { type: 'text/plain' }))
      });
      await navigator.clipboard.write([clip]);
      dispatchNotification({
        message: 'System info was copied to the clipboard',
        autohideDuration: 3000
      })();
    } catch (error) {
      console.error(
        'An error occured whilst trying to write to the system clipboard.'
      );
      console.error(error);
    }
  }

  return (
    <InvisibleButton
      id="hidden-info-dump-trigger"
      onClick={onTriggerSystemInfo}
    />
  );
};

const InvisibleButton = styled.button`
  position: fixed;
  left: 0;
  top: 10%;
  background-color: rgba(0, 0, 0, 0, 1);
  z-index: ${zIndexes.overlays};
  width: 50px;
  height: 50px;
  border: none;
  user-select: none;
  -webkit-user-select: none; /*Safari*/
  -moz-user-select: none; /*Firefox*/
  outline: ${isLocalDevelopment || isDevelopment
    ? '1px dotted var(--asBuilt)'
    : 'inital'};

  @media screen and (orientation: landscape) {
    top: unset;
    right: unset;
    bottom: 0;
    left: calc(var(--echo-sidebar-width) + env(safe-area-inset-left));
  }
`;

export { SystemInfoTrigger };
