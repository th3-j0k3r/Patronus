import type { FC } from 'react';

const LoadingSpinner: FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={'animate-spin rounded-full border-b-2 ' + className}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
