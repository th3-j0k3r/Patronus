import type { FC } from 'react';
import ScannerActions from '../../../components/container/scanner-actions';

interface RepositoryOverviewWithActionsProps {
  isResolved: boolean;
  reposName: string;
  depsUrl: string;
  id: string;
  isFalsePositive: boolean;
  isJiraRaised: boolean;
}

const RepositoryOverviewWithActions: FC<RepositoryOverviewWithActionsProps> = ({
  isResolved,
  reposName,
  depsUrl,
  id,
  isFalsePositive,
  isJiraRaised,
}) => {
  return (
    <div
      className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20
    rounded-md 
    p-2 
    text-gray-50"
    >
      <h3 className="font-semibold pb-2 text-base">
        Repository Name : <span className="font-normal">{reposName}</span>
      </h3>
      <hr />
      <div className="grid grid-cols-1 lg:grid-cols-2  gap-2 pt-2">
        <div className="overflow-hidden">
          <h5 className="font-semibold text-base">Dependency URL</h5>
          <a
            href={depsUrl}
            className="hover:text-blue-400 text-blue-300"
            target="_blank"
            rel="noreferrer"
          >
            <small>{depsUrl}</small>
          </a>
        </div>
        <ScannerActions
          isJiraRaised={isJiraRaised}
          isResolved={isResolved}
          isFalsePositive={isFalsePositive}
          id={id}
        />
      </div>
    </div>
  );
};

export default RepositoryOverviewWithActions;
