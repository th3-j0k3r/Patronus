import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiRoutes } from '../../../api-routes';
import type { ScannerResponse } from '../../../api-routes/types/scanner';
import ScanPageTableWrapper from '../../../components/container/scan-pages-table-wrapper';
import QuickActions from '../../../components/container/scan-pages-table-wrapper/quick-actions';
import {
  handleToggleScanID,
  isAllSelected,
  isSelected,
  toggleAllSection,
} from '../../../components/helpers/scan-page-table-methods';
import {
  TableDataCheckBox,
  TableHeaderCheckbox,
} from '../../../components/shared/table-checkbox';
import {
  TableData,
  TableHeader,
} from '../../../components/shared/table-elements';
import { findScanType, slugify } from '../../../utils/helpers';

const ScanTableDataView: FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { query } = useRouter();

  const [tableData, setTableData] = useState<ScannerResponse | undefined>();

  const { isValidating, data, error } = useSWR<ScannerResponse>(
    apiRoutes.getOnDemandScannedResults +
      `?invoke_id=${query.id}&page_num=${pageNumber}`,
  );

  useEffect(() => {
    let isCancelled = false;
    if (!isCancelled && !isValidating) {
      setTableData(data);
    }
    return () => {
      isCancelled = true;
    };
  }, [data, isValidating]);

  if (isValidating && !tableData) {
    return (
      <div className="flex items-center justify-center mt-12">
        <div className="w-20 h-20 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <h5 className="text-white text-xl">
        Something went wrong while fetching data.
      </h5>
    );
  }

  return (
    <ScanPageTableWrapper
      data={tableData}
      pageNumber={pageNumber}
      setPageNumber={setPageNumber}
      selectedIds={selectedIds}
      setEnteredTerm={() => {}}
      showSearch={false}
      searchBy={'language'}
      setSearchBy={() => {}}
      resetIds={setSelectedIds}
      filterByOptions={[
        { name: 'project_name', title: 'Project Name' },
        { name: 'language', title: 'Language' },
        { name: 'secret_type', title: 'Secret Type' },
      ]}
    >
      <thead>
        <tr>
          <TableHeaderCheckbox
            options={{
              checked: isAllSelected(tableData, selectedIds),
              onChange: () =>
                toggleAllSection(tableData, selectedIds, setSelectedIds),
            }}
          />
          <TableHeader title="ID" />
          <TableHeader title="Scanner" />
          <TableHeader title="Is Resolved" />
          <TableHeader title="Severity" />
          <TableHeader title="Action" />
        </tr>
      </thead>

      <tbody>
        {!tableData?.results?.length ? (
          <tr>
            <td className="mt-4 block">No new vulnerabilities found in scan</td>
          </tr>
        ) : (
          tableData?.results?.map((result, index) => {
            const scanType = findScanType(result.scanner);

            return (
              <tr key={result.scan_id}>
                <TableDataCheckBox
                  options={{
                    checked: isSelected(result.scan_id, selectedIds),
                    disabled: result.is_resolved || result.mark_as_fp || false,
                    onChange: () => {
                      handleToggleScanID(result.scan_id, setSelectedIds);
                    },
                  }}
                />
                <TableData>
                  {scanType === 'ss' && (
                    <Link
                      href={`/secret-scanning/${result.scan_id}/${slugify(
                        result.project_name || 'na',
                      )}`}
                    >
                      <a>{tableData.prev_page_count + index + 1}</a>
                    </Link>
                  )}

                  {scanType === 'sast' && (
                    <Link
                      href={`/static-application-security-testing/${
                        result.scan_id
                      }/${slugify(result.project_name || 'na')}`}
                    >
                      <a>{tableData.prev_page_count + index + 1}</a>
                    </Link>
                  )}

                  {scanType === 'sca' && (
                    <Link
                      href={`/software-composition-analysis/${
                        result.scan_id
                      }/${slugify(result.project_name || 'na')}`}
                    >
                      <a>{tableData.prev_page_count + index + 1}</a>
                    </Link>
                  )}
                  {scanType === 'unknown' && (
                    <span>{tableData.prev_page_count + index + 1}</span>
                  )}
                </TableData>
                <TableData title={result.scanner} />
                <TableData title={`${result.is_resolved || false}`} />
                <TableData title={result.severity || '-'} />
                <QuickActions
                  isTicketRaised={result.jira_raised || false}
                  id={result.scan_id}
                  isMarkAsFalse={result.mark_as_fp || false}
                  isResolved={result.is_resolved || false}
                />
              </tr>
            );
          })
        )}
      </tbody>
    </ScanPageTableWrapper>
  );
};

export default ScanTableDataView;
