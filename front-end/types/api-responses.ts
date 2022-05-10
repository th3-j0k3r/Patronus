export interface AllAssetsEntity {
  scan_success_count: number;
  scan_fail_count: number;
  total_scan_count: number;
  total_assets: number;
  total_assets_in_7_days: number;
  total_assets_in_30_days: number;
  total_sast_reports: number;
  total_sca_reports: number;
  total_secrets_scanning_reports: number;
  total_vuln: number;
  total_results_in_7_days: number;
  total_results_in_30_days: number;
  top_ten_vuln_dependencies?: TopTenVulnDependenciesEntity[];
  top_ten_vuln_class?: TopTenVulnClassEntity[];
  top_ten_secret_scanning_tags?: TopTenSecretScanningTagsEntity[];
  top_ten_repos_with_highest_vuln?: TopTenReposWithHighestVulnEntity[];
  vulnerability_trend?: VulnerabilityTrendEntity[];
  total_vuln_not_fixed_in_seven_days: number;
  total_vuln_not_fixed_in_thirty_days: number;
  total_vuln_not_fixed_in_sixty_days: number;
  total_vuln_not_fixed_in_ninety_days: number;
}
export interface TopTenVulnDependenciesEntity {
  dependency: string;
  count: number;
}
export interface TopTenVulnClassEntity {
  vuln_class: string;
  count: number;
}
export interface TopTenSecretScanningTagsEntity {
  secret_scan_tags: string;
  count: number;
}
export interface TopTenReposWithHighestVulnEntity {
  vuln_by_repo: string;
  count: number;
}
export interface VulnerabilityTrendEntity {
  name: string;
  SAST: number;
  SCA: number;
  SS: number;
}

export interface AssetsResponse {
  results?: AssetsResultsEntity[] | null;
  has_prev: boolean;
  has_next: boolean;
  next_num: number;
}
export interface AssetsResultsEntity {
  asset_name: string;
  owner?: null;
  asset_id: string;
  language: string;
  creation_date: string;
  last_commit_date: string;
  image_name?: string | null;
}

export interface SCAResponse {
  results?: SCAResultsEntity[] | null;
  has_prev: boolean;
  has_next: boolean;
  next_num: number;
}
export interface SCAResultsEntity {
  issue: SCAIssue;
  severity?: null;
  is_pci_service?: null;
  creation_date: string;
  contains_pii?: null;
  hash: string;
  mark_as_fp?: null;
  secrets_scanning_tag?: null;
  scan_id: string;
  has_public_expoit: boolean;
  scanner: string;
  dependency_url: string;
  is_external_service?: null;
  is_resolved?: null;
  language: string;
  project_name: string;
  bug_class?: null;
}
export interface SCAIssue {
  repo: string;
  scanner: string;
  bug_type: string;
  language: string;
  class_name: string;
  method_name: string;
  line_no_start: string;
  line_no_end: string;
  file_name: string;
  vulnerable_code: string;
  severity: string;
  module_name: string;
  advisories_url: string;
  vulnerable_versions: string;
  patched_versions: string;
  dependency_url: string;
  description: string;
  source_url: string;
  title: string;
  source: string;
  cvss_score: number;
  line_no: string;
  author: string;
  commit: string;
  date: string;
  tags: string;
}

export interface SecretScanningResponse {
  results?: SecretScanningResultsEntity[] | null;
  has_prev: boolean;
  has_next: boolean;
  next_num: number;
}
export interface SecretScanningResultsEntity {
  issue: SecretScanningIssue;
  severity?: null;
  is_pci_service?: null;
  creation_date: string;
  contains_pii?: null;
  hash: string;
  mark_as_fp?: null;
  secrets_scanning_tag: string;
  scan_id: string;
  has_public_expoit?: null;
  scanner: string;
  dependency_url?: null;
  is_external_service?: null;
  is_resolved: boolean;
  language: string;
  project_name: string;
  bug_class?: null;
}
export interface SecretScanningIssue {
  repo: string;
  scanner: string;
  bug_type: string;
  language: string;
  class_name: string;
  method_name: string;
  line_no_start: string;
  line_no_end: string;
  file_name: string;
  vulnerable_code: string;
  severity: string;
  module_name: string;
  advisories_url: string;
  vulnerable_versions: string;
  patched_versions: string;
  dependency_url: string;
  description: string;
  source_url: string;
  title: string;
  source: string;
  cvss_score: string;
  line_no: string;
  author: string;
  commit: string;
  date: string;
  tags: string;
}
