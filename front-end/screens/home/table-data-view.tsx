import type { FC } from 'react';
import { Fragment, useState } from 'react';
import type {
  TopTenReposWithHighestVulnEntity,
  TopTenVulnDependenciesEntity,
} from '../../types/api-responses';

interface TableDataViewProps {
  dataForVulnerableRepos: TopTenVulnDependenciesEntity[] | null;
  dataForRepoWithHighestVulns: TopTenReposWithHighestVulnEntity[] | null;
}

const TableDataView: FC<TableDataViewProps> = ({
  dataForVulnerableRepos,
  dataForRepoWithHighestVulns,
}) => {
  const [inView, setInView] = useState<'1' | '2'>('1');

  return (
    <div className="chart-card p-3   text-white">
      <div className="flex flex-col break-words w-full rounded h-80 ">
        <div className="rounded-t py-3 border-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-grow flex-1">
              <h3
                className={`${
                  inView === '1' ? 'bg-blue-400/60' : ''
                } rounded-md transform transition-colors duration-500 font-medium text-lg cursor-pointer cut-text-1 p-1`}
                onClick={() => setInView('1')}
              >
                Top Ten Vulnerable Repositories
              </h3>
            </div>
            <div className="flex-grow flex-1">
              <h3
                className={`${
                  inView === '2' ? 'bg-blue-400/60' : ''
                } rounded-md transform transition-colors duration-500 font-medium text-lg cursor-pointer cut-text-1 p-1`}
                onClick={() => setInView('2')}
              >
                Top Ten Repositories With Security Issues
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="pl-2 flex-grow flex-1 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-medium text-left">
              <h3 className="font-medium ">Repository Name</h3>
            </div>
            <div className="pr-3 flex-grow flex-1 border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-medium text-right">
              <h3 className="font-medium">Count</h3>
            </div>
          </div>
        </div>

        <div className="block w-full overflow-x-auto">
          <table className="items-center bg-transparent w-full border-collapse">
            {inView === '1' ? (
              <tbody>
                {!dataForVulnerableRepos?.length ? (
                  <tr>
                    <td>No results found</td>
                  </tr>
                ) : (
                  <Fragment>
                    {dataForVulnerableRepos?.map((each, idx) => {
                      return (
                        <tr key={idx}>
                          <td className="pl-2 w-full border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap py-4 text-left text-blueGray-700 ">
                            {each.dependency}
                          </td>
                          <td className="border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap py-4 text-left pr-3">
                            {each.count}
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                )}
              </tbody>
            ) : (
              <tbody>
                {!dataForVulnerableRepos?.length ? (
                  <tr>
                    <td>No results found</td>
                  </tr>
                ) : (
                  <Fragment>
                    {dataForRepoWithHighestVulns?.map((each, idx) => {
                      return (
                        <tr key={idx}>
                          <td className="pl-2 w-full border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap py-4 text-left text-blueGray-700 ">
                            {each.vuln_by_repo}
                          </td>
                          <td className="border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap py-4 text-left pr-3">
                            {each.count}
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableDataView;
