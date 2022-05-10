import type { FC } from 'react';
import type {
  ScannerIssueEntity,
  ScannerResultsEntity,
} from '../../../api-routes/types/scanner';
import { toLocalString } from '../../../utils/helpers';

interface RepositoryInfoProps {
  data: ScannerResultsEntity;
  parsedIssue: ScannerIssueEntity | null;
}

const RepositoryInfo: FC<RepositoryInfoProps> = ({ data, parsedIssue }) => {
  return (
    <div
      className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20
    rounded-md 
    p-2 
    text-gray-50"
    >
      <div className="flex  mb-1 ">
        <span className="font-semibold text-stone-200 block text-sm w-28">
          Reported Date
        </span>
        <span className="mx-6">:</span>
        <span className="font-light text-sm">
          {toLocalString(data.creation_date)}
        </span>
      </div>
      <div className="flex  mb-1">
        <span className="font-semibold text-stone-200 block text-sm w-28">
          Commit Author
        </span>
        <span className="mx-6">:</span>
        <span className="font-light text-sm">{parsedIssue?.author || '-'}</span>
      </div>
      <div className="flex  mb-1">
        <span className="font-semibold text-stone-200 block text-sm w-28">
          Commit file
        </span>
        <span className="mx-6">:</span>
        <span className="font-light text-sm">{parsedIssue?.file_name}</span>
      </div>
      <div className="flex  mb-1">
        <span className="font-semibold text-stone-200 block text-sm w-28">
          Secret Type
        </span>
        <span className="mx-6">:</span>
        <span className="font-light text-sm">{parsedIssue?.tags}</span>
      </div>
      <div className="flex  ">
        <span className="font-semibold text-stone-200 block text-sm w-28">
          Commit ID
        </span>
        <span className="mx-6">:</span>
        <span className="font-light text-sm">{parsedIssue?.commit}</span>
      </div>
    </div>
  );
};

export default RepositoryInfo;
