import type { FC } from 'react';
import { Fragment, useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiRoutes } from '../../api-routes';
import type { ScannerResponse } from '../../api-routes/types/scanner';
import TableDataView from './table-data';

const SCAView: FC = () => {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scannedResult, setScannedResult] = useState<ScannerResponse>();

  const { isValidating, data, error } = useSWR<ScannerResponse>(
    apiRoutes.getScannedResults('sca') + `&page_num=${pageNumber}`,
  );

  useEffect(() => {
    let isCancelled = false;

    if (!isCancelled && data && !isValidating) {
      setScannedResult(data);
    }

    return () => {
      isCancelled = true;
    };
  }, [data, isValidating]);

  if (isValidating && !scannedResult) {
    return (
      <div className="flex items-center justify-center mt-12">
        <div className="w-20 h-20 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <h5 className="text-white text-xl">
        Something went wrong while fetching data.
      </h5>
    );
  }

  return (
    <Fragment>
      <TableDataView
        setPageNumber={setPageNumber}
        data={scannedResult}
        pageNumber={pageNumber}
      />
    </Fragment>
  );
};

export default SCAView;
