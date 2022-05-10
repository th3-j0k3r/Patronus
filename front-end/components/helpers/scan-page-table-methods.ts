import type { Dispatch, SetStateAction } from 'react';
import type { ScannerResponse } from '../../api-routes/types/scanner';

export function isSelected(scanId: string, selectedIds: string[]) {
  return selectedIds.some((id) => id === scanId);
}

export function handleToggleScanID(
  scanId: string,
  setSelectedIds: Dispatch<SetStateAction<string[]>>,
) {
  setSelectedIds((current) => {
    if (isSelected(scanId, current)) {
      return current.filter((id) => id !== scanId);
    }
    return [...current, scanId];
  });
}

export function isAllSelected(
  tableData: ScannerResponse | undefined,
  selectedIds: string[],
) {
  return (
    !tableData?.results
      ?.filter((data) => !data.is_resolved || !data.is_resolved)
      .some((id) => !selectedIds.includes(id.scan_id)) && selectedIds.length > 0
  );
}

export function toggleAllSection(
  tableData: ScannerResponse | undefined,
  selectedIds: string[],
  setSelectedIds: Dispatch<SetStateAction<string[]>>,
) {
  if (isAllSelected(tableData, selectedIds)) {
    setSelectedIds([]);
  } else {
    const selectedItems = tableData?.results
      ?.filter((data) => !data.is_resolved || !data.is_resolved)
      ?.map((each) => each.scan_id);
    if (selectedItems?.length) {
      setSelectedIds((current) => [...current, ...selectedItems]);
    }
  }
}
