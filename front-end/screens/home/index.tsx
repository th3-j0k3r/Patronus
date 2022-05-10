import type { FC } from 'react';
import { Fragment } from 'react';
import useSWR from 'swr';
import { apiRoutes } from '../../api-routes';
import type { DashboardResponse } from '../../api-routes/types/dashboard';
import SectionTitle from '../../components/shared/section-heading';
import HomePageSkeleton from '../../components/skeletons/home';
import {
  createShortVersion,
  createShortVersionOfKeyForVunClass,
} from '../../utils/helpers';
import BarChart from './bar-chart';
import CVEView from './cve-trend';
import GenericMetrics from './generic-metrics';
import SCAPubExploitTrend from './sca-pub-exploit-trend';
import ScanTrendView from './scan-trend';
import TableDataView from './table-data-view';
import VulnerabilityBarChart from './vulnerability-trend/bar-chart';

const HomeView: FC = () => {
  const { isValidating, data } = useSWR<DashboardResponse>(
    apiRoutes.getDashBoardData,
  );

  if (isValidating) {
    return <HomePageSkeleton />;
  }
console.log(data);
  return (
    <Fragment>
      <SectionTitle
        title="Vulnerability Management Overview"
        showDivider={true}
      />

       <GenericMetrics
        scan={{
          total: data?.scan_info?.total_scan_count || 0,
          topMetic: { count: data?.scan_info?.scan_success_count || 0 },
          bottomMetic: { count: data?.scan_info?.scan_fail_count || 0 },
        }}
        assets={{
          total: data?.asset_info?.total_assets || 0,
          topMetic: { count: data?.asset_info?.total_assets_in_7_days || 0 },
          bottomMetic: {
            count: data?.asset_info?.total_assets_in_30_days || 0,
          },
        }}
        reports={{
          total: data?.count_of_vuln_by_scanner.total_sast_reports || 0,
          topMetic: {
            count: data?.count_of_vuln_by_scanner.total_sca_reports || 0,
          },
          bottomMetic: {
            count:
              data?.count_of_vuln_by_scanner.total_secrets_scanning_reports ||
              0,
          },
        }}
        vulnsInnDays={{
          total: data?.past_vuln_info.total_vuln || 0,
          topMetic: {
            count: data?.past_vuln_info.total_results_in_7_days || 0,
          },
          bottomMetic: {
            count: data?.past_vuln_info.total_results_in_30_days || 0,
          },
        }}
      /> 

       <div className="grid grid-cols-2 my-4">
        <div className="col-span-2">
          <VulnerabilityBarChart
            data={data?.monthly_report?.vulnerability_trend || []}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 mt-4">
        <BarChart
          title=" Top Secret Scanning Tags"
          data={
            data?.top_ten_secret_scanning_tags?.top_ten_secret_scanning_tags
              ?.map((each) => ({
                tag: each.secret_scan_tags,
                count: each.count,
                short_key: createShortVersion(each.secret_scan_tags),
              }))
              .sort((a, b) => a.count - b.count) || []
          }
          comparekeys={['count']}
          indexKey="short_key"
          keysNames={{ left: 'Secret Scanning Tag', bottom: 'Count' }}
          margin={{
            top: 10,
            right: 0,
            bottom: 45,
            left: 70,
          }}
        />

        <BarChart
          title="Top Vulnerable class"
          data={
            data?.top_ten_vuln_class?.top_ten_vuln_class
              ?.map((sst) => ({
                class: sst.vuln_class,
                short_key: createShortVersionOfKeyForVunClass(sst.vuln_class),
                count: sst.count,
              }))
              .sort((a, b) => a.count - b.count) || []
          }
          comparekeys={['count']}
          indexKey="short_key"
          keysNames={{ left: 'Vulnerable class', bottom: 'Count' }}
          margin={{
            top: 10,
            right: 0,
            bottom: 45,
            left: 75,
          }}
        />
      </div>

      <div className="grid gap-4  lg:grid-cols-2 grid-cols-1 mt-4 ">
        <TableDataView
          dataForVulnerableRepos={
            data?.top_ten_vuln_dependencies.top_ten_vuln_dependencies || null
          }
          dataForRepoWithHighestVulns={
            data?.top_ten_repos_with_highest_vuln
              .top_ten_repos_with_highest_vuln || null
          }
        />

        <BarChart
          title="Top Repositories With Highest Bugs"
          data={
            data?.top_ten_repos_with_highest_vuln.top_ten_repos_with_highest_vuln
              ?.map((sst) => ({
                repo: sst.vuln_by_repo,
                count: sst.count,
                short_key: createShortVersion(sst.vuln_by_repo),
              }))
              .sort((a, b) => a.count - b.count) || []
          }
          comparekeys={['count']}
          indexKey="short_key"
          keysNames={{ left: 'Repos with Highest Bugs', bottom: 'Count' }}
          margin={{
            top: 10,
            right: 0,
            bottom: 45,
            left: 70,
          }}
        />
      </div>
      <div className="grid gap-4  lg:grid-cols-2 grid-cols-1 my-4 ">
        <SCAPubExploitTrend data={data?.sca_pub_exploit_trend} />
        <ScanTrendView data={data?.sast_sca_ss_trend} />
      </div> 

      <CVEView />
    </Fragment>
  );
};

export default HomeView;
