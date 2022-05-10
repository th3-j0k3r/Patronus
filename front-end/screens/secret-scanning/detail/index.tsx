import type { FC } from 'react';
import { Fragment } from 'react';
import useSWR from 'swr';
import { apiRoutes } from '../../../api-routes';
import type { ScanDetailedResponse } from '../../../api-routes/types/scanner';
import Occurrence from '../../../components/container/scan-detail/scan-occurrence';
import SectionTitle from '../../../components/shared/section-heading';
import SSDetailSkeleton from '../../../components/skeletons/scanned-reponse-detail/ss-scan';
import type { ScannedDetailViewProps } from '../../../types/globals';
import { parseIssue } from '../../../utils/helpers';
import AffectedLine from './affected-line';
import HowToRemediate from './how-to-remediate';
import RepositoryInfo from './repository-info';
import RepositoryOverviewWithActions from './repository-overview-with-actions';

const SecretScanningDetailView: FC<ScannedDetailViewProps> = ({ params }) => {
  const { isValidating, data, error } = useSWR<ScanDetailedResponse>(
    apiRoutes.getIndividualScannedResponse(params.repo, params.id),
  );
    
  if (isValidating) {
    return <SSDetailSkeleton />;
  }

  if (error || !data?.output) {
    return (
      <h5 className="text-white text-xl">
        Something went wrong while fetching data.
      </h5>
    );
  }

  return (
    <Fragment>
      <SectionTitle title="Secret Scanning" showDivider={true} />
      <RepositoryOverviewWithActions
        isJiraRaised={data.output.jira_raised || false}
        description={parseIssue(data.output.issue)?.description || ''}
        isResolved={data.output.is_resolved || false}
        reposName={data.output.project_name}
        id={data.output.scan_id}
        isFalsePositive={data.output.mark_as_fp || false}
      />
      <RepositoryInfo
        data={data.output}
        parsedIssue={parseIssue(data.output.issue)}
      />
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <AffectedLine
          line={parseIssue(data.output.issue)?.line_no || '-'}
          commitId={parseIssue(data.output.issue)?.commit || ''}
          repo={parseIssue(data.output.issue)?.repo || ''}
          fileName={parseIssue(data.output.issue)?.file_name || ''}
          bitbucket_url={data?.bitbucket_url || ''}
        />
        <Occurrence data={data.similar_vulns} />
      </div>
      <HowToRemediate />
    </Fragment>
  );
};

export default SecretScanningDetailView;
