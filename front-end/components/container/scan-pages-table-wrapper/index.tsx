import { motion } from 'framer-motion';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import type { ScannerResponse } from '../../../api-routes/types/scanner';
import type { ScanSearchOptions } from '../../../types/globals';
import { markAsFalsePositive, markAsResolved } from '../../helpers/mark-scan';
import PaginationControls from '../../shared/pagination-ctrls';
import SelectInput from '../../shared/select-inputs';

interface ScanPageTableWrapper {
  data?: ScannerResponse;
  setPageNumber: Dispatch<SetStateAction<number>>;
  children: ReactNode;
  pageNumber: number;
  selectedIds: string[];
  setEnteredTerm: Dispatch<SetStateAction<string>>;
  setSearchBy: Dispatch<SetStateAction<ScanSearchOptions>>;
  searchBy: ScanSearchOptions;
  resetIds: Dispatch<SetStateAction<string[]>>;
  filterByOptions: { title: string; name: string }[];
  showSearch?: boolean;
}

const ScanPageTableWrapper: FC<ScanPageTableWrapper> = ({
  data,
  setPageNumber,
  pageNumber,
  children,
  selectedIds,
  setEnteredTerm,
  searchBy,
  setSearchBy,
  resetIds,
  filterByOptions,
  showSearch = true,
}) => {
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [isSuppressing, setIsSuppressing] = useState<boolean>(false);

  return (
    <div className="mt-8">
      <div
        className={` justify-between  text-white items-center ${
          showSearch ? 'flex' : 'hidden'
        }`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={selectedIds.length ? { opacity: 1 } : { opacity: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex lg:justify-end  items-center">
            <button
              disabled={isResolving || isSuppressing}
              onClick={async () => {
                setIsResolving(true);
                const { isResolved } = await markAsResolved(selectedIds);

                if (isResolved) {
                  setPageNumber(0);
                  resetIds([]);
                  setIsResolving(false);
                  setPageNumber(pageNumber);
                }
              }}
              className="
           border border-opacity-30
           mr-2 p-1 px-3
           rounded-md 
           bg-green-600
           hover:bg-green-800 flex items-center"
            >
              {isResolving ? <ImSpinner2 className="animate-spin mr-2" /> : ''}
              {isResolving ? 'Please wait' : 'Resolve'}
            </button>
            <button
              disabled={isResolving || isSuppressing}
              onClick={async () => {
                setIsSuppressing(true);
                const { isFalsePositive } = await markAsFalsePositive(
                  selectedIds,
                );

                if (isFalsePositive) {
                  setPageNumber(0);
                  setTimeout(() => {
                    setPageNumber(pageNumber);
                    resetIds([]);
                    setIsSuppressing(false);
                  }, 50);
                }
              }}
              className="
           border border-opacity-30
           mx-2 p-1 px-3
           rounded-md 
            bg-red-600
           hover:bg-red-800 flex items-center
          "
            >
              {isSuppressing ? (
                <ImSpinner2 className="animate-spin mr-2" />
              ) : (
                ''
              )}
              {isSuppressing ? 'Please wait' : ' Mark as FP'}
            </button>
          </div>
        </motion.div>
        <div className="flex justify-end">
          <input
            onChange={(e) => {
              setEnteredTerm(e.target.value);
              if (pageNumber !== 1) {
                setPageNumber(1);
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
          appearance-none cursor-pointer pr-6`,
              onChange: (ev) => {
                setSearchBy(ev.target.value as ScanSearchOptions);
                if (pageNumber !== 1) {
                  setPageNumber(1);
                }
              },
              defaultValue: searchBy,
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
      </div>
      <section className="grid grid-cols-1 chart-card mt-5 text-white overscroll-x-auto">
        <div className="w-full mx-auto ">
          <div className="relative flex flex-col min-w-0 break-words w-full rounded ">
            <div className="block w-full overflow-x-auto relative ">
              <table className="items-center bg-transparent w-full border-collapse ">
                {children}
              </table>
            </div>
          </div>
        </div>
        <PaginationControls
          pageNumber={pageNumber}
          hasNext={data?.has_next}
          hasPrev={data?.has_prev}
          setPageNumber={setPageNumber}
        />
      </section>
    </div>
  );
};

export default ScanPageTableWrapper;
