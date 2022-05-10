import type { FC } from 'react';

const AffectedLine: FC<{
  line: string;
  commitId: string;
  repo: string;
  fileName: string;
  bitbucket_url:string;
}> = ({ line, commitId, repo, fileName,bitbucket_url }) => {
  return (
    <div
      className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20
    rounded-md
    text-gray-50
    overflow-auto
    p-2
    "
    >
      <div className="flex items-center justify-between">
        <h5 className="p-2">Affected Line</h5>
        <div>
          <a
            href={bitbucket_url}
            target={'_blank'}
            rel="noreferrer"
          >
            <button className="text-sm sm:text-base mx-1 px-2 py-1 border rounded border-opacity-30 hover:bg-gray-50 hover:text-black">
              View file
            </button>
          </a>
        </div>
      </div>
      <div className="p-2 overflow-auto">
        <pre className="p-1 px-2 rounded bg-gray-700 min-w-min text-red-400">
          <code>{line}</code>
        </pre>
      </div>
    </div>
  );
};

export default AffectedLine;
