import type { FC } from 'react';
import type { ScannerIssueEntity } from '../../../api-routes/types/scanner';

const HowTO: FC<{ issue: ScannerIssueEntity | null }> = ({ issue }) => {
  return (
    <div className="bg-black bg-opacity-70 p-2 rounded-md text-gray-50">
      <h5>How to Remediate</h5>
      <small>Patched Versions - {issue?.patched_versions} </small>
    </div>
  );
};

export default HowTO;
