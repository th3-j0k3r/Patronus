import { useEffect } from 'react';
import { _window } from '../utils/web.apis';

export const useServiceWorker = () => {
  useEffect(() => {
    let isCancelled = false;

    if (isCancelled) {
      return;
    }

    // check if browser supports sw
    if ('serviceWorker' in navigator) {
      if (_window()) {
        navigator.serviceWorker
          .register('/sw.js')
          .then(() => {
            console.warn(`Service worker registered`);
          })
          .catch((reason) => {
            console.warn(`Service worker registeration failed - ${reason}`);
          });
      }
    } else {
      console.info('Service worker is not supported');
    }
    return () => {
      isCancelled = true;
    };
  }, []);

  return null;
};
