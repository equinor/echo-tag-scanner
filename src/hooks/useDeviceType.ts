import EchoUtils from '@equinor/echo-utils';
import { useState } from 'react';

const { useInitial } = EchoUtils.Hooks;

/**
 * Hook for checking if page is loaded from mobile device.
 * This hook is tailored for use in the STIDCamera port.
 * @returns boolean true if on mobile.
 */
function useDeviceType(): 'mobile' | 'desktop' {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useInitial(() => {
    if (!mounted) {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      ) {
        // true for mobile device
        setIsMobile(true);
      } else {
        // false for not mobile device
        setIsMobile(false);
      }
      setMounted(true);
    }
  });

  if (isMobile) {
    return 'mobile';
  } else {
    return 'desktop';
  }
}

export { useDeviceType };
