import type { FC } from 'react';
import { Fragment } from 'react';
import Description from './common/description';
import HeaderInfoAndQuickActionsSkeleton from './common/header-and-quick-actions';
import Occurance from './common/occurance';
import ScannedInfo from './common/scanner-info';

const SCADetailSkeleton: FC = () => {
  return (
    <Fragment>
      <HeaderInfoAndQuickActionsSkeleton />
      <ScannedInfo cols={2} />

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <Description />
        <Occurance />
      </div>

      <div className="bg-black bg-opacity-70 p-2 rounded-md">
        <span className="skeleton h-4 w-44 rounded mb-2 block" />
        <span className="skeleton h-4 w-32 rounded mb-2 block" />
      </div>
    </Fragment>
  );
};

export default SCADetailSkeleton;
