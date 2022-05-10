import type { Dispatch, FC, SetStateAction } from 'react';
import { Fragment, useRef, useState } from 'react';
import useSWR from 'swr';
import { apiRoutes } from '../../../api-routes';
import useHandleClose from '../../../hooks/useHandleClose';
import DropDownResultsWrapper from '../common/drop-down-results-wrapper';

interface RepoSearchProps {
  setSelectedRepo: Dispatch<SetStateAction<string>>;
  selectedRepo: string;
}

const RepoSearch: FC<RepoSearchProps> = ({ selectedRepo, setSelectedRepo }) => {
  const [isMutated, setIsMutated] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');

  const { isValidating, data, error } = useSWR<{ repos: string[] }>(
    isMutated ? apiRoutes.getRepos(searchString) : '',
  );

  const inputRef = useRef<HTMLDivElement>(null);

  useHandleClose<HTMLDivElement | null>(() => {
    setIsMutated(false);
  }, inputRef);

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

    if (!data?.repos.length) {
      return (
        <div className="p-1">
          <p className="px-1 py-1.5">No results found</p>
        </div>
      );
    }

    return (
      <Fragment>
        {data?.repos.map((repo) => {
          return (
            <p
              title={repo}
              key={repo}
              className="px-1 py-1.5 hover:bg-slate-200 hover:text-slate-800 rounded
              cursor-pointer "
              onClick={() => {
                setSelectedRepo(repo);
                setSearchString(repo);
              }}
            >
              {repo}
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
        name="search-sca"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        className={`
        ${isMutated ? 'rounded-t-lg' : 'rounded-lg'} 
          p-2 bg-opacity-50 bg-white 
          focus:outline-none
          text-white w-full  placeholder-gray-200`}
        placeholder={'Repository'}
        autoComplete="off"
      />
      <DropDownResultsWrapper show={isMutated}>
        <ResultsBody />
      </DropDownResultsWrapper>
    </div>
  );
};

export default RepoSearch;
