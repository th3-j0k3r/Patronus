import type { FC } from 'react';
import { Fragment } from 'react';
import useSWR from 'swr';
import { apiRoutes } from '../../../api-routes';
import type { ScanDetailedResponse } from '../../../api-routes/types/scanner';
import Occurrence from '../../../components/container/scan-detail/scan-occurrence';
import SectionTitle from '../../../components/shared/section-heading';
import SCADetailSkeleton from '../../../components/skeletons/scanned-reponse-detail/sca-scan';
import type { ScannedDetailViewProps } from '../../../types/globals';
import { parseIssue } from '../../../utils/helpers';
import HowTO from './how-to';
import RepositoryDescription from './repository-description';
import RepositoryInfo from './repository-info';
import RepositoryOverviewWithActions from './repository-overview-with-actions';

const SoftwareCompositionAnalysisDetailView: FC<ScannedDetailViewProps> = ({
  params,
}) => {
  const { isValidating, data, error } = useSWR<ScanDetailedResponse>(
    apiRoutes.getIndividualScannedResponse(params.repo, params.id),
  );

  if (isValidating) {
    return <SCADetailSkeleton />;
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
      <SectionTitle
        title={'Software Composition Analysis'}
        showDivider={true}
      />
      <RepositoryOverviewWithActions
        isJiraRaised={data.output.jira_raised || false}
        isResolved={data?.output.is_resolved || false}
        reposName={parseIssue(data?.output.issue as any)?.repo || '-'}
        depsUrl={data?.output.dependency_url || '-'}
        id={data.output.scan_id}
        isFalsePositive={data.output.mark_as_fp || false}
      />
      <RepositoryInfo
        data={data.output}
        parsedIssue={parseIssue(data.output.issue)}
      />
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <RepositoryDescription
          description={parseIssue(data.output.issue)?.description || 'N/A'}
        />
        <Occurrence data={data.similar_vulns} />
      </div>
      <HowTO issue={parseIssue(data.output.issue)} />
    </Fragment>
  );
};

export default SoftwareCompositionAnalysisDetailView;
