import type { FC } from 'react';
import ChartSkeleton from './common/chart';
import ReportCardSkeleton from './report-card';

const HomePageSkeleton: FC = () => {
  return (
    <div>
      <h1 className=" mb-3 skeleton h-6 w-1/3 rounded-lg" />
      <hr className="mb-3" />
      <div className="grid xl:grid-cols-4  lg:grid-cols-2  md:grid-cols-2 :sm:grid-cols-2  grid-cols-1 gap-4 mb-4">
        {new Array(4).fill('').map((_, index) => (
          <ReportCardSkeleton key={index} />
        ))}
      </div>
      <ChartSkeleton className="h-80" />
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mt-4">
        <ChartSkeleton className="h-64" />
        <ChartSkeleton className="h-64" />
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mt-4">
        <ChartSkeleton className="h-64" />
        <ChartSkeleton className="h-64" />
      </div>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 my-4">
        <ChartSkeleton className="h-40" />
        <ChartSkeleton className="h-40" />
      </div>
      <ChartSkeleton className="h-60" />
    </div>
  );
};

export default HomePageSkeleton;
