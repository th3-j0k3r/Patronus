import type { FC } from 'react';
import { Fragment } from 'react';
import HeaderInfoAndQuickActionsSkeleton from './common/header-and-quick-actions';
import Occurance from './common/occurance';
import ScannedInfo from './common/scanner-info';

const SSDetailSkeleton: FC = () => {
  return (
    <Fragment>
      <HeaderInfoAndQuickActionsSkeleton />
      <ScannedInfo cols={1} />

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <div
          className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20 rounded-md
      h-56 overflow-auto w-full p-2
    "
        >
          <div className=" flex items-center justify-between">
            <span className="skeleton h-6 w-44 rounded mb-2 block " />
            <div className="flex">
              <div
                className="
                    border border-opacity-30
                    mr-2 p-1 px-3
                    rounded-md skeleton h-8 w-20"
              />
              <div
                className="
                    border border-opacity-30
                    mr-2 p-1 px-3
                    rounded-md skeleton h-8 w-28"
              />
            </div>
          </div>
          <div className="p-2 overflow-auto">
            <pre className="p-1 px-2 rounded bg-gray-700 min-w-min">
              <span className="skeleton h-8 w-full rounded  block " />
            </pre>
          </div>
        </div>
        <Occurance />
      </div>

      <div className="bg-black bg-opacity-70 p-2 rounded-md">
        <div
          className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20
    rounded-md
    text-gray-50
  p-3
    "
        >
          <span className="skeleton h-5 w-52 rounded  block mb-2" />
          <hr className="border-opacity-30" />

          <div className="stepper flex flex-col p-4">
            <div className="flex mb-1">
              <div className="flex flex-col pr-4 items-center">
                <div className="rounded-full py-1 px-3 skeleton  mb-1 border border-opacity-60 h-8 w-8" />
                <div className="border-l border-opacity-70 h-28 skeleton" />
              </div>
              <div className="w-full">
                <span className="skeleton h-5 w-32 rounded  block mb-2" />

                {new Array(3).fill('').map((_, idx) => {
                  return (
                    <span
                      className="skeleton h-4 w-full rounded block mb-1"
                      key={idx}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex mb-1">
              <div className="flex flex-col pr-4 items-center">
                <div className="rounded-full py-1 px-3 skeleton  mb-1 border border-opacity-60 h-8 w-8" />
              </div>
              <div className="w-full">
                <span className="skeleton h-5 w-32 rounded  block mb-2" />

                {new Array(3).fill('').map((_, idx) => {
                  return (
                    <span
                      className="skeleton h-4 w-full rounded block mb-1"
                      key={idx}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SSDetailSkeleton;
