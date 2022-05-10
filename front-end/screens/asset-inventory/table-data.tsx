import type { Dispatch, FC, SetStateAction } from 'react';
import { Fragment, useEffect, useState } from 'react';
import { BsChevronExpand } from 'react-icons/bs';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import useSWR from 'swr';
import { apiRoutes } from '../../api-routes';
import type { AssetsResponse } from '../../api-routes/types/assets';
import PaginationControls from '../../components/shared/pagination-ctrls';
import SelectInput from '../../components/shared/select-inputs';
import { TableData, TableHeader } from '../../components/shared/table-elements';
import type {
  AssetInventoryFilterType,
  AssetInventorySearchOptions,
} from '../../types/globals';
import { toLocalString } from '../../utils/helpers';

interface TableDataViewProps {
  data?: AssetsResponse;
  setAssetTablePageNumber: Dispatch<SetStateAction<number>>;
  setFilterBy: Dispatch<SetStateAction<AssetInventoryFilterType>>;
  filterBy: AssetInventoryFilterType;
  setOrder: Dispatch<SetStateAction<'desc' | 'asc'>>;
  order: 'desc' | 'asc';
  assetTablePageNumber: number;
}

const TableDataView: FC<TableDataViewProps> = ({
  data: defaultData,
  setAssetTablePageNumber,
  setFilterBy,
  filterBy,
  order,
  setOrder,
  assetTablePageNumber,
}) => {
  const [enteredTerm, setEnteredTerm] = useState<string>('');
  const [tableData, setTableData] = useState<AssetsResponse | undefined>(
    defaultData,
  );
  const [searchBy, setSearchBy] =
    useState<AssetInventorySearchOptions>('asset_name');

  const { data, isValidating } = useSWR<AssetsResponse>(
    enteredTerm.trim().length
      ? apiRoutes.assetSearch +
          `?${searchBy}=${enteredTerm}&page_num=${assetTablePageNumber}`
      : '',
  );

  useEffect(() => {
    let isCancelled = false;
    if (!isCancelled) {
      if (enteredTerm.length && !isValidating) {
        setTableData(data);
      } else {
        setTableData(defaultData);
      }
    }
    return () => {
      isCancelled = true;
    };
  }, [data, defaultData, enteredTerm.length, isValidating]);

  return (
    <Fragment>
      <div className="flex justify-end mt-12">
        <input
          onChange={(e) => {
            setEnteredTerm(e.target.value);
            if (assetTablePageNumber !== 1) {
              setAssetTablePageNumber(1);
            }
          }}
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
          appearance-none cursor-pointer w-36 `,
            onChange: (ev) => {
              setSearchBy(ev.target.value as AssetInventorySearchOptions);
              if (assetTablePageNumber !== 1) {
                setAssetTablePageNumber(1);
              }
            },
            defaultValue: searchBy,
          }}
        >
          <option value="asset_name">Asset name</option>
          <option value="image_name">Image name</option>
          <option value="language">Language</option>
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
                    <TableHeader title="ID" />
                    <TableHeader title=" Asset Name" />
                    <TableHeader title="Creation Date">
                      <FilterToggle
                        filterBy={filterBy}
                        order={order}
                        setOrder={setOrder}
                        setFilterBy={setFilterBy}
                        filterFor="creation_date"
                      />
                    </TableHeader>
                    <TableHeader title="Language" />
                    <TableHeader title="Last Commit Date">
                      <FilterToggle
                        filterBy={filterBy}
                        order={order}
                        setOrder={setOrder}
                        setFilterBy={setFilterBy}
                        filterFor="last_commit_date"
                      />
                    </TableHeader>
                    <TableHeader title="Image Name" />
                  </tr>
                </thead>

                <tbody>
                  {!tableData?.results?.length ? (
                    <tr>
                      <td className="mt-4 block">No results found</td>
                    </tr>
                  ) : (
                    tableData.results?.map((each, idx) => {
                      return (
                        <tr key={each.asset_id}>
                          <TableData
                            title={`${tableData.prev_page_count + idx + 1}`}
                          />
                          <TableData title={each.asset_name} />
                          <TableData
                            title={toLocalString(each.creation_date)}
                          />
                          <TableData title={each.language || '-'} />
                          <TableData
                            title={toLocalString(each.last_commit_date)}
                          />
                          <TableData title={each.image_name || '-'} />
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
          pageNumber={assetTablePageNumber}
          hasPrev={tableData?.has_prev}
          hasNext={tableData?.has_next}
          setPageNumber={setAssetTablePageNumber}
        />
      </section>
    </Fragment>
  );
};

export default TableDataView;

const FilterToggle: FC<
  Omit<
    TableDataViewProps,
    'data' | 'setAssetTablePageNumber' | 'assetTablePageNumber'
  > & {
    filterFor: AssetInventoryFilterType;
  }
> = ({ filterBy, setOrder, order, setFilterBy, filterFor }) => {
  if (filterBy === filterFor) {
    return (
      <div
        className="flex flex-col justify-center items-center"
        onClick={() => {
          setOrder((order) => (order === 'asc' ? 'desc' : 'asc'));
        }}
      >
        {order === 'desc' ? (
          <FaChevronDown
            className={`ml-2 cursor-pointer font-extrabold`}
            title="Click to view in Ascending order"
          />
        ) : (
          <FaChevronUp
            className={`ml-2 cursor-pointer font-extrabold`}
            title="Click to view in Descending order"
          />
        )}
      </div>
    );
  }

  return (
    <BsChevronExpand
      className="ml-2 cursor-pointer "
      onClick={() => {
        setOrder('asc');
        setFilterBy(filterFor);
      }}
      title="Click to view in Ascending order"
    />
  );
};
