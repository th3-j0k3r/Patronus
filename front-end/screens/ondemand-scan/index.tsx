import axios from 'axios';
import { useSession } from 'next-auth/client';
import type { FC } from 'react';
import { Fragment, useState } from 'react';
import { ImSpinner8 } from 'react-icons/im';
import { apiRoutes } from '../../api-routes';
import type { OnDemandInitiateResponse } from '../../api-routes/types';
import SectionTitle from '../../components/shared/section-heading';
import { getRequestOptions } from '../../hooks/useSWRConfig';
import BranchSearch from './search-panel/branch-search';
import RepoSearch from './search-panel/repo-search';
import ScanType from './search-panel/scan-types';
import OnDemandScanDataTableView from './tables/ondemand-scan-data-table';

const OnDemandScanView: FC = () => {
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedScanType, setSelectedScanType] = useState<string>('');
  const [loading, setIsLoading] = useState<boolean>(false);
  const [shouldValidateData, setShouldValidateData] = useState<boolean>(false);

  const [user] = useSession();

  async function initiateScan() {
    try {
      setIsLoading(true);
      const formData = new FormData();

      formData.append('reponame', selectedRepo);
      formData.append('branch', selectedBranch);

      formData.append('scan_type', selectedScanType.toLowerCase());

      formData.append('author', user?.user?.email || '');

      await axios.post<OnDemandInitiateResponse>(
        apiRoutes.initiateOnDemandScan,
        formData,
        {
          ...getRequestOptions,
        },
      );
      setSelectedRepo('');
      setSelectedBranch('');
      setSelectedScanType('');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  return (
    <Fragment>
      <SectionTitle title="On Demand Scan" showDivider={true} />

      <div className="grid lg:grid-cols-4 grid-cols-1 gap-3">
        <RepoSearch
          selectedRepo={selectedRepo}
          setSelectedRepo={setSelectedRepo}
        />
        <BranchSearch
          isDisabled={!selectedRepo.length}
          selectedRepo={selectedRepo}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
        />
        <ScanType
          selectedScantype={selectedScanType}
          setSelectedScantype={setSelectedScanType}
          isDisabled={!selectedBranch || !selectedRepo}
        />

        <div className="flex justify-end">
          <button
            onClick={initiateScan}
            disabled={!selectedBranch || !selectedRepo || !selectedScanType}
            className="p-2 text-white bg-gray-50 hover:bg-white transform transition-all hover:text-black bg-opacity-60 
            mx-2 px-6 rounded shadow-lg flex items-center"
          >
            {loading ? <ImSpinner8 className="animate-spin mr-2" /> : ''}
            {loading ? 'Please wait' : 'Start Scan'}
          </button>
        </div>
      </div>

      <OnDemandScanDataTableView
        revalidate={shouldValidateData}
        setRevalidate={setShouldValidateData}
      />
    </Fragment>
  );
};

export default OnDemandScanView;
