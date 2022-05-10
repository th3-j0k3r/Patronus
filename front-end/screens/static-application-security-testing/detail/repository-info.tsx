import type { FC } from 'react';
import { Fragment } from 'react';
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
            <span className="font-semibold text-stone-200 block text-sm w-32">
              Language
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm">{data.language || '-'}</span>
          </div>
          <div className="flex  mb-1">
            <span className="font-semibold text-stone-200 block text-sm w-32">
              Repository
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm capitalize">
              {parsedIssue?.repo || '-'}
            </span>
          </div>
          <div className="flex  mb-1">
            <span className="font-semibold text-stone-200 block text-sm w-32">
              Line Number
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm capitalize">
              {parsedIssue?.line_no || '-'}
            </span>
          </div>
          <div className="flex  mb-1">
            <span className="font-semibold text-stone-200 block text-sm w-32">
              Scanner
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm capitalize">
              {data.scanner || '-'}
            </span>
          </div>

          {data.scanner === 'find-sec-bugs' ? (
            <div className="flex ">
              <span className="font-semibold text-stone-200 block text-sm w-32">
                Class Name
              </span>
              <span className="mx-6">:</span>
              <span className="font-light text-sm capitalize">
                {parsedIssue?.class_name || '-'}
              </span>
            </div>
          ) : (
            ''
          )}

          {data.scanner === 'gosec' ? (
            <Fragment>
              <div className="flex overflow-hidden mr-2">
                <span className="font-semibold text-stone-200 block text-sm w-32 ">
                  File Name
                </span>
                <span className="mx-6">:</span>
                <span
                  className="font-light text-sm capitalize w-32 whitespace-nowrap"
                  title={parsedIssue?.file_name}
                >
                  {parsedIssue?.file_name || '-'}
                </span>
              </div>
            </Fragment>
          ) : (
            ''
          )}
        </div>
        <div>
          <div className="flex  mb-1">
            <span className="font-semibold text-stone-200 block text-sm w-32">
              Bug Type
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm capitalize">
              {parsedIssue?.bug_type || '-'}
            </span>
          </div>
          <div className="flex  mb-1">
            <span className="font-semibold text-stone-200 block text-sm w-32">
              Title
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm capitalize">
              {parsedIssue?.title || '-'}
            </span>
          </div>

          <div className="flex  mb-1 ">
            <span className="font-semibold text-stone-200 block text-sm w-32">
              Creation Date
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm">
              {toLocalString(data.creation_date) || '-'}
            </span>
          </div>

          <div className="flex  mb-1">
            <span className="font-semibold text-stone-200 block text-sm w-32">
              Is Resolved
            </span>
            <span className="mx-6">:</span>
            <span className="font-light text-sm">
              {data.is_resolved ? 'Yes' : 'No'}
            </span>
          </div>

          {data.scanner === 'find-sec-bugs' ? (
            <div className="flex ">
              <span className="font-semibold text-stone-200 block text-sm w-32">
                Method Name
              </span>
              <span className="mx-6">:</span>
              <span className="font-light text-sm capitalize">
                {parsedIssue?.method_name || '-'}
              </span>
            </div>
          ) : (
            ''
          )}

          {data.scanner === 'gosec' ? (
            <div className="flex ">
              <span className="font-semibold text-stone-200 block text-sm w-32">
                Severity
              </span>
              <span className="mx-6">:</span>
              <span className="font-light text-sm capitalize">
                {parsedIssue?.severity || '-'}
              </span>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  );
};

export default RepositoryInfo;
