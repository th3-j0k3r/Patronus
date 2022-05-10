import type { MutableRefObject } from 'react';
import { useEffect } from 'react';
import { _document } from '../utils/web.apis';

const useHandleClose = <T>(
  callback: CallableFunction,
  ref?: MutableRefObject<T>,
) => {
  const handleClick = (e: any) => {
    if (ref?.current instanceof HTMLElement) {
      if (ref?.current && !ref.current.contains(e.target)) {
        callback();
      }
    }
  };

  useEffect(() => {
    _document()?.addEventListener('click', handleClick);

    return () => {
      _document()?.removeEventListener('click', handleClick);
    };
  });
};

export default useHandleClose;
