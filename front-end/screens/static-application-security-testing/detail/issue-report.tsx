import type { FC } from 'react';

interface IssueReportProps {
  code: string;
  repo: string;
  bugType: string;
}

const IssueReport: FC<IssueReportProps> = ({ bugType, code, repo }) => {
  return (
    <div className="grid grid-cols-1 gap-x-4 h-full">
      <div
        className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20
      rounded-md
      text-gray-50
 
      overflow-auto
      "
      >
        <h5 className="p-2">Vulnerable Code</h5>
        <hr className="border-opacity-30" />

        <div className="p-2 overflow-auto">
          <pre className="p-1 px-2 rounded bg-gray-700 min-w-min text-red-400">
            <code>{code}</code>
          </pre>
        </div>
      </div>
      {/* <div
        className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20
      rounded-md
      text-gray-50
      p-3
      flex flex-col justify-center
      "
      >
        <div className="flex  mb-1 ">
          <span className="font-semibold block text-sm w-28">Repository</span>
          <span className="mx-6">:</span>
          <span className="font-light text-sm">{repo}</span>
        </div>
        <div className="flex  mb-1">
          <span className="font-semibold block text-sm w-28">Bug Type</span>
          <span className="mx-6">:</span>
          <span className="font-light text-sm">{bugType}</span>
        </div>
      </div> */}
    </div>
  );
};

export default IssueReport;
