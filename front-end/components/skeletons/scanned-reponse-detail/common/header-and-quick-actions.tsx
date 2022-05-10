import { Fragment } from 'react';

export default function HeaderInfoAndQuickActionsSkeleton(): JSX.Element {
  return (
    <Fragment>
      <div className="mb-3 skeleton h-8 w-72 rounded-md" />
      <hr className="skeleton mb-4" />
      <div
        className="mb-4  rounded-md p-2   bg-surface-md-dark
        border-gray-50 border border-opacity-20"
      >
        <div className="flex mb-2">
          <span className="rounded skeleton h-5 w-32 " />
          <span className="rounded skeleton h-5 w-56 ml-2" />
        </div>
        <hr className="skeleton mb-1" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 pt-2">
          <div>
            <div className="skeleton h-6 w-60 rounded-md mb-2" />
            <span className="rounded skeleton h-5 w-56  block" />
          </div>
          <div className="flex lg:justify-end  items-center">
            {new Array(3).fill('').map((_, idx) => {
              return (
                <div
                  key={idx}
                  className="
                    border border-opacity-30
                    mr-2 p-1 px-3
                    rounded-md skeleton h-8 w-28"
                />
              );
            })}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
