import Link from 'next/link';
import type { FC } from 'react';
import { Fragment } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs';
import ScanTableDataView from './scanned-data-table';

const OnDemandDetailView: FC = () => {
  return (
    <Fragment>
      <div className="flex gap-x-4 items-center mb-3">
        <Link href={'/on-demand-scan'}>
          <a className="flex items-center bg-blue-500 text-gray-50 hover:text-opacity-80 rounded-full p-2 hover:bg-blue-400/40">
            <BsArrowLeftShort size={20} />
            <small className="mr-1.5">BACK</small>
          </a>
        </Link>
        <h1 className="text-white  text-xl font-normal">{'On Demand Scan'}</h1>
      </div>
      <hr className="mb-3" />
      <ScanTableDataView />
    </Fragment>
  );
};

export default OnDemandDetailView;
