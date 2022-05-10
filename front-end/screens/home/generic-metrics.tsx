import type { FC } from 'react';
import { BsUpcScan } from 'react-icons/bs';
import { MdReportProblem, MdWebAsset } from 'react-icons/md';
import { VscReport } from 'react-icons/vsc';
import { ReportCard } from '../../components/container/reportcard';

interface GenericReportType {
  total: number;
  topMetic: {
    count: number;
  };
  bottomMetic: {
    count: number;
  };
}

interface GenericMetricsProps {
  scan: GenericReportType;
  assets: GenericReportType;
  reports: GenericReportType;
  vulnsInnDays: GenericReportType;
}

const GenericMetrics: FC<GenericMetricsProps> = ({
  assets,
  reports,
  scan,
  vulnsInnDays,
}) => {
  return (
    <div className="grid xl:grid-cols-4  lg:grid-cols-2  md:grid-cols-2 :sm:grid-cols-2  grid-cols-1 gap-4">
      <ReportCard
        cardInfo="info about scans"
        icon={<BsUpcScan />}
        count={scan.total}
        title="Scans"
        subTitle="Total Scans"
        topMetrics={{
          count: scan.topMetic.count,
          title: 'success',
          textColor: 'text-green-300',
        }}
        bottomMetrics={{
          count: scan.bottomMetic.count,
          title: 'failure',
          textColor: 'text-red-300',
        }}
      />
      <ReportCard
        cardInfo="info about total assets"
        icon={<MdWebAsset />}
        count={assets.total}
        title="Assets"
        subTitle="Total Assets"
        topMetrics={{ count: assets.topMetic.count, title: '7 Days' }}
        bottomMetrics={{ count: assets.bottomMetic.count, title: '30 Days' }}
      />
      <ReportCard
        cardInfo="info about reports"
        icon={<VscReport />}
        count={reports.total}
        title="Total Reports"
        subTitle="SAST"
        topMetrics={{ count: reports.topMetic.count, title: 'SCA' }}
        bottomMetrics={{
          count: reports.bottomMetic.count,
          title: 'Secret Scan',
        }}
      />
      <ReportCard
        cardInfo="info about vulnerabilities"
        icon={<MdReportProblem />}
        count={vulnsInnDays.total}
        title="Vulnerability Not fixed in"
        subTitle="7 Days"
        topMetrics={{
          count: vulnsInnDays.topMetic.count,
          title: '30 Days',
          countColor: 'text-red-300',
        }}
        bottomMetrics={{
          count: reports.bottomMetic.count,
          title: '60 Days',
          countColor: 'text-red-300',
        }}
        countColor="text-red-300"
      />
    </div>
  );
};

export default GenericMetrics;
