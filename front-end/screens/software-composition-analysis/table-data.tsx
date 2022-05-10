import Link from 'next/link';
import type { Dispatch, FC, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiRoutes } from '../../api-routes';
import type { ScannerResponse } from '../../api-routes/types/scanner';
import ScanPageTableWrapper from '../../components/container/scan-pages-table-wrapper';
import QuickActions from '../../components/container/scan-pages-table-wrapper/quick-actions';
import {
  handleToggleScanID,
  isAllSelected,
  isSelected,
  toggleAllSection,
} from '../../components/helpers/scan-page-table-methods';
import {
  TableDataCheckBox,
  TableHeaderCheckbox,
} from '../../components/shared/table-checkbox';
import { TableData, TableHeader } from '../../components/shared/table-elements';
import type { ScanSearchOptions } from '../../types/globals';
import { parseIssue, slugify, toLocalString } from '../../utils/helpers';

interface TableDataViewProps {
  data?: ScannerResponse;
  setPageNumber: Dispatch<SetStateAction<number>>;
  pageNumber: number;
}

const TableDataView: FC<TableDataViewProps> = ({
  data: defaultData,
  setPageNumber,
  pageNumber,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [enteredTerm, setEnteredTerm] = useState<string>('');
  const [searchBy, setSearchBy] = useState<ScanSearchOptions>('project_name');

  const [tableData, setTableData] = useState<ScannerResponse | undefined>(
    defaultData,
  );

  const { isValidating, data } = useSWR<ScannerResponse>(
    enteredTerm.trim().length
      ? apiRoutes.searchScannedResults('sca', searchBy, enteredTerm) +
          `&page_num=${pageNumber}`
      : '',
  );

  useEffect(() => {
    let isCancelled = false;
    if (!isCancelled) {
      if (enteredTerm.length && !isValidating) {
        setTableData(data);
      } else {
        setTableData(defaultData);
      }
    }
    return () => {
      isCancelled = true;
    };
  }, [data, defaultData, enteredTerm.length, isValidating]);

  return (
    <ScanPageTableWrapper
      data={tableData}
      pageNumber={pageNumber}
      setPageNumber={setPageNumber}
      selectedIds={selectedIds}
      setEnteredTerm={setEnteredTerm}
      searchBy={searchBy}
      setSearchBy={setSearchBy}
      resetIds={setSelectedIds}
      filterByOptions={[
        { name: 'project_name', title: 'Project Name' },
        { name: 'language', title: 'Language' },
        { name: 'title', title: 'Title' },
        { name: 'dependency_url', title: 'Dependency URL' },
        { name: 'severity', title: 'Severity' },
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
          <TableHeader title="Project Name" />
          <TableHeader title="Language" />
          <TableHeader title="Title" />
          <TableHeader title="Dependency URL" />
          <TableHeader title="Creation Date" />
          <TableHeader title="Is Resolved" />
          <TableHeader title="Severity" />
          <TableHeader title="Action" />
        </tr>
      </thead>

      <tbody>
        {!tableData?.results?.length ? (
          <tr>
            <td className="mt-4 block">No results found</td>
          </tr>
        ) : (
          tableData?.results?.map((each, index) => {
            return (
              <tr key={each.scan_id}>
                <TableDataCheckBox
                  options={{
                    checked: isSelected(each.scan_id, selectedIds),
                    disabled: each.is_resolved || each.mark_as_fp || false,
                    onChange: () => {
                      handleToggleScanID(each.scan_id, setSelectedIds);
                    },
                  }}
                />
                <TableData>
                  <Link
                    href={`/software-composition-analysis/${
                      each.scan_id
                    }/${slugify(each.project_name || 'na')}`}
                  >
                    <a>{tableData.prev_page_count + index + 1}</a>
                  </Link>
                </TableData>
                <TableData>
                  <Link
                    href={`/software-composition-analysis/${
                      each.scan_id
                    }/${slugify(each.project_name || 'na')}`}
                  >
                    <a>{each.project_name}</a>
                  </Link>
                </TableData>
                <TableData title={each.language || '-'} />
                <TableData title={parseIssue(each.issue as any)?.title || ''} />
                <TableData title={each.dependency_url || '-'} />
                <TableData title={toLocalString(each.creation_date)} />
                <TableData title={`${each.is_resolved || false}`} />
                <TableData title={each.severity || '-'} />
                <QuickActions
                  id={each.scan_id}
                  isMarkAsFalse={each.mark_as_fp || false}
                  isResolved={each.is_resolved || false}
                  isTicketRaised={each.jira_raised || false}
                />
              </tr>
            );
          })
        )}
      </tbody>
    </ScanPageTableWrapper>
  );
};

export default TableDataView;
