import { useEffect, useState } from 'react';
import { _window } from '../utils/web.apis';

/**
 * @provides info about the browser!
 * @returns
 *      - Window size:{height and width}
 */
const useBrowserInfo = () => {
  const [windowSize, setWindowSize] = useState<{
    height: number;
    width: number;
  }>({ height: 0, width: 0 });

  useEffect(() => {
    let isCancelled = false;
    const window = _window();
    if (isCancelled) {
      return;
    }
    if (!window) {
      return;
    }

    setWindowSize({
      height: window.innerHeight,
      width: window.innerWidth,
    });

    // Dom resize listener
    window?.addEventListener('resize', () => {
      setWindowSize({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    windowSize,
  };
};

export default useBrowserInfo;
