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
      <div className="grid lg:grid-cols-2 grid-cols-1">
        <div>
          <div className="flex  mb-1 ">
            <span className="font-semibold block text-stone-200 text-sm w-32">
              Language
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm">{data.language || '-'}</span>
          </div>
          <div className="flex  mb-1">
            <span className="font-semibold block text-stone-200 text-sm w-32">
              Source
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm">
              {parsedIssue?.source || '-'}
            </span>
          </div>
          <div className="flex  mb-1">
            <span className="font-semibold block text-stone-200 text-sm w-32">
              CVSS
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm">
              {parsedIssue?.cvss_score || '-'}
            </span>
          </div>
          <div className="flex mb-1">
            <span className="font-semibold block text-stone-200 text-sm w-32">
              Is Resolved
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm">
              {data.is_resolved ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex ">
            <span className="font-semibold block text-stone-200 text-sm w-32">
              Title
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm">{parsedIssue?.title}</span>
          </div>
        </div>
        <div>
          <div className="flex  mb-1 ">
            <span className="font-semibold block text-stone-200 text-sm w-32">
              Creation Date
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm">
              {toLocalString(data.creation_date) || '-'}
            </span>
          </div>
          <div className="flex  mb-1">
            <span className="font-semibold block text-stone-200 text-sm w-32">
              Has Public Exploit
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm">
              {data.has_public_expoit ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex  mb-1">
            <span className="font-semibold block text-stone-200 text-sm w-32">
              Repository
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm capitalize">
              {data.project_name || '-'}
            </span>
          </div>
          <div className="flex mb-1">
            <span className="font-semibold block text-stone-200 text-sm w-32">
              Scanner
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm capitalize">
              {data.scanner || '-'}
            </span>
          </div>
          <div className="flex ">
            <span className="font-semibold block text-stone-200 text-sm w-32">
              Source URL
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm">
              <a
                href={parsedIssue?.source_url}
                target={'_blank'}
                rel="noreferrer"
                className="hover:text-blue-400 text-blue-300"
              >
                {parsedIssue?.source_url}
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryInfo;
