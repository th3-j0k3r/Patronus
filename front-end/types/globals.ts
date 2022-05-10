import type { Session } from 'next-auth';

export interface BasePageProps {
  session: Session | null;
}

export type AssetInventoryFilterType =
  | ''
  | 'creation_date'
  | 'last_commit_date';

export type AssetInventorySearchOptions =
  | 'asset_name'
  | 'image_name'
  | 'language';

export type ScanSearchOptions =
  | 'project_name'
  | 'language'
  | 'title'
  | 'dependency_url'
  | 'severity'
  | 'secret_type';

export interface ScannedDetailViewProps {
  params: {
    id: string;
    repo: string;
  };
}
