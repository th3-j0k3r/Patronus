export interface ScannerResponse {
  results?: ScannerResultsEntity[];
  has_prev: boolean;
  has_next: boolean;
  next_num: number;
  prev_page_count: number;
}
export interface ScannerResultsEntity {
  language: string;
  severity?: null;
  _fp?: null;
  invoke_type?: null;
  scan_id: string;
  invoke_id?: null;
  bug_class?: null;
  contains_pii?: null;
  dependency_url: string;
  project_name: string;
  is_resolved?: boolean | null;
  secrets_scanning_tag?: null;
  is_pci_service?: null;
  creation_date: string;
  has_public_expoit?: boolean | null;
  /**
   *@info Parsed Type ScannerIssueEntity
   */
  issue: string;
  is_external_service?: null;
  scanner: string;
  hash: string;
  jira_raised?: boolean;
}

export interface ScannerIssueEntity {
  date: string;
  repo: string;
  tags: string;
  title: string;
  author: string;
  commit: string;
  source: string;
  line_no: string;
  scanner: string;
  bug_type: string;
  language: string;
  severity: string;
  file_name: string;
  class_name: string;
  cvss_score: number;
  source_url: string;
  description: string;
  line_no_end: string;
  method_name: string;
  module_name: string;
  line_no_start: string;
  advisories_url: string;
  dependency_url: string;
  vulnerable_code: string;
  patched_versions: string;
  vulnerable_versions: string;
}

export interface ScanDetailedResponse {
  output: ScannerResultsEntity;
  similar_vulns: SimilarVulns;
}

export interface SimilarVulns {
  similar_vuln_data?: SimilarVulnDataEntity[] | null;
}
export interface SimilarVulnDataEntity {
  project_name: string;
  count: number;
}
