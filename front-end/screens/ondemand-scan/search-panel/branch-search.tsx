import type { Dispatch, FC, SetStateAction } from 'react';
import { Fragment, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { apiRoutes } from '../../../api-routes';
import useHandleClose from '../../../hooks/useHandleClose';
import DropDownResultsWrapper from '../common/drop-down-results-wrapper';

interface BranchSearchProps {
  isDisabled: boolean;
  selectedRepo: string;
  setSelectedBranch: Dispatch<SetStateAction<string>>;
  selectedBranch: string;
}

const BranchSearch: FC<BranchSearchProps> = ({
  isDisabled,
  selectedRepo,
  selectedBranch,
  setSelectedBranch,
}) => {
  const [isMutated, setIsMutated] = useState<boolean>(false);

  const { isValidating, data, error } = useSWR<{ branches: string[] }>(
    isMutated ? apiRoutes.getBranches(selectedRepo) : '',
  );

  const inputRef = useRef<HTMLDivElement>(null);

  useHandleClose<HTMLDivElement | null>(() => {
    setIsMutated(false);
  }, inputRef);

  useEffect(() => {
    let isCancelled = false;

    if (!isCancelled && selectedRepo) {
      setSelectedBranch('');
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedRepo]);

  const ResultsBody: FC = () => {
    if (isValidating) {
      return (
        <div className="p-1">
          {new Array(6).fill('').map((_, idx) => {
            return (
              <div key={idx} className="px-1 py-1.5">
                <span className="skeleton h-5 w-full rounded  block mb-1 mr-1 bg-gray-400" />
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <Fragment>
        {data?.branches.map((branch) => {
          return (
            <p
              title={branch}
              key={branch}
              className="px-1 py-1.5 hover:bg-slate-200 hover:text-slate-800 rounded
              cursor-pointer "
              onClick={() => {
                setSelectedBranch(branch);
              }}
            >
              {branch}
            </p>
          );
        })}
      </Fragment>
    );
  };

  return (
    <div ref={inputRef} className="w-full relative">
      <input
        onClick={() => setIsMutated(true)}
        type="text"
        value={selectedBranch}
        onChange={() => {}}
        name="search-branch"
        className={`
        ${isMutated ? 'rounded-t-lg' : 'rounded-lg'} 
        p-2 bg-opacity-50 bg-white 
          focus:outline-none select-none  
          text-white w-full  placeholder-gray-200`}
        placeholder={'Branch'}
        autoComplete="off"
        disabled={isDisabled}
        style={{ caretColor: 'transparent' }}
      />
      <DropDownResultsWrapper show={isMutated}>
        <ResultsBody />
      </DropDownResultsWrapper>
    </div>
  );
};

export default BranchSearch;
