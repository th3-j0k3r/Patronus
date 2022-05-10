import Link from 'next/link';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiRoutes } from '../../../api-routes';
import type { OnDemandScanResponse } from '../../../api-routes/types';
import PaginationControls from '../../../components/shared/pagination-ctrls';
import SelectInput from '../../../components/shared/select-inputs';
import {
  TableData,
  TableHeader,
} from '../../../components/shared/table-elements';

interface OnDemandScanDataTableViewProps {
  revalidate: boolean;
  setRevalidate: Dispatch<SetStateAction<boolean>>;
}

const OnDemandScanDataTableView: FC<OnDemandScanDataTableViewProps> = ({}) => {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [tableData, setTableData] = useState<OnDemandScanResponse>();
  const [enteredTerm, setEnteredTerm] = useState<string>('');
  const [searchBy, setSearchBy] = useState<string>('author');

  const { isValidating, data, error } = useSWR<OnDemandScanResponse>(
    apiRoutes.getOnDemandScan +
      `${enteredTerm.length ? `?${searchBy}=${enteredTerm}` : ''}`,
    { refreshInterval: 60 * 1000 },
  );

  useEffect(() => {
    let isCancelled = false;

    if (!isCancelled && !isValidating) {
      setTableData(data);
    }

    return () => {
      isCancelled = true;
    };
  }, [isValidating, data]);

  const filterByOptions = [
    {
      title: 'Author',
      name: 'author',
    },
    {
      title: 'Repository',
      name: 'reponame',
    },
  ];

  if (isValidating) {
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
    <div className="[min-height:80vh]">
      <div className="flex justify-end mt-6">
        <input
          onChange={(e) => {
            setEnteredTerm(e.target.value);
          }}
          value={enteredTerm}
          type="text"
          name="search-sca"
          className="p-2 rounded rounded-r-none
          bg-opacity-50 bg-white 
          focus:outline-none 
           text-white sm:w-72 w-full placeholder-gray-200"
          placeholder="Search..."
          autoComplete="off"
        />
        <SelectInput
          options={{
            className: `p-2 px-4 rounded rounded-l-none
          bg-opacity-50 bg-white 
          focus:outline-none
          text-white  placeholder-gray-200
          border-l border-opacity-60
          appearance-none cursor-pointer pr-6`,
            onChange: (ev) => {
              setSearchBy(ev.target.value);
              if (pageNumber !== 1) {
                setPageNumber(1);
              }
            },
          }}
        >
          {filterByOptions.map((option) => {
            return (
              <option key={option.name} value={option.name}>
                {option.title}
              </option>
            );
          })}
        </SelectInput>
      </div>
      <section className="grid grid-cols-1 bg-blueGray-50 chart-card mt-5 text-white overscroll-x-auto">
        <div className="w-full mx-auto ">
          <div className="relative flex flex-col min-w-0 break-words w-full rounded ">
            <div className="block w-full overflow-x-auto">
              <table
                className={`items-center bg-transparent w-full border-collapse`}
              >
                <thead>
                  <tr>
                    <TableHeader title="Invoke Id" />
                    <TableHeader title="Repo name" />
                    <TableHeader title="Scan Status" />
                    <TableHeader title="Author" />
                    <TableHeader title="Creation Date" />
                    <TableHeader title="Invoke type" />
                    <TableHeader title="Scan Type" />
                  </tr>
                </thead>

                <tbody>
                  {!tableData?.results?.length && !isValidating ? (
                    <tr>
                      <td className="mt-4 block">No results found</td>
                    </tr>
                  ) : (
                    tableData?.results?.map((scan, idx) => {
                      return (
                        <tr key={scan.scan_id}>
                          <TableData>
                            <Link
                              href={`/on-demand-scan/${scan.scan_invoke_id}`}
                            >
                              <a>{scan.scan_invoke_id}</a>
                            </Link>
                          </TableData>
                          <TableData title={scan.reponame} />
                          <TableData
                            title={
                              scan.scan_successful ? 'Completed' : 'OnGoing'
                            }
                          />
                          <TableData title={scan.author} />
                          <TableData title={scan.scan_start_time} />
                          <TableData title={scan.invoke_type} />
                          <TableData title={scan.scan_type} />
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <PaginationControls
          pageNumber={pageNumber}
          hasNext={tableData?.has_next}
          hasPrev={tableData?.has_prev}
          setPageNumber={setPageNumber}
        />
      </section>
    </div>
  );
};

export default OnDemandScanDataTableView;
