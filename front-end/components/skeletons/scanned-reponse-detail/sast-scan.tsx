import type { FC } from 'react';
import { Fragment } from 'react';
import Description from './common/description';
import HeaderInfoAndQuickActionsSkeleton from './common/header-and-quick-actions';
import Occurance from './common/occurance';
import ScannedInfo from './common/scanner-info';

const SASTDetailSkeleton: FC = () => {
  return (
    <Fragment>
      <HeaderInfoAndQuickActionsSkeleton />
      <ScannedInfo cols={2} />

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <Description />
        <Occurance />
      </div>

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-x-4">
        <div
          className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20
      rounded-md
      max-h-56
      overflow-auto
      "
        >
          <span className="skeleton h-6 w-44 rounded  block m-2" />
          <hr className="border-opacity-30" />

          <div className="p-2 overflow-auto">
            <pre className="p-1 px-2 rounded bg-gray-700 min-w-min">
              <span className="skeleton h-8 w-full rounded  block " />
            </pre>
          </div>
        </div>
        <div
          className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20
      rounded-md
      p-3
      flex flex-col justify-center
      "
        >
          <div className="flex  mb-1 ">
            <span className="skeleton h-5 w-1/2 rounded  block mb-1 mr-1" />
            <span className="skeleton h-5 w-1/2 rounded  block mb-1 mr-1" />
          </div>
          <div className="flex  mb-1">
            <span className="skeleton h-5 w-1/2 rounded  block mb-1 mr-1" />
            <span className="skeleton h-5 w-1/2 rounded  block mb-1 mr-1" />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SASTDetailSkeleton;
