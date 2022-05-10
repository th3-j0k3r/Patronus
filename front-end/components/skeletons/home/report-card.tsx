import type { FC } from 'react';

const ReportCardSkeleton: FC = () => {
  return (
    <div className="w-auto bg-surface-md-dark rounded p-3 shadow-2xl h-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex">
          <span className="skeleton h-4 w-32 rounded mb-1 block" />
          <span className="skeleton h-4 w-3 ml-2 rounded mb-1 block" />
        </div>
        <span className="skeleton h-4 w-4 rounded mb-1 block" />
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="mt-auto">
          <span className="skeleton h-4 w-32 rounded mb-1 block" />
          <span className="skeleton h-6 w-12 rounded mb-1 block" />
        </div>

        <div className="flex flex-col items-end ">
          <span className="skeleton h-5 w-12 rounded mb-1 block" />
          <span className="skeleton h-3 w-32 rounded mb-1 block" />
          <span className="skeleton h-5 w-12 rounded mb-1 block" />{' '}
          <span className="skeleton h-3 w-32 rounded mb-1 block" />
        </div>
      </div>
    </div>
  );
};

export default ReportCardSkeleton;
