import type { ScannerResultsEntity } from './scanner';

export interface DashboardResponse {
  sast_sca_ss_trend: SastScaSsTrend;
  sca_pub_exploit_trend: ScaPubExploitTrend;
  scan_info: ScanInfo;
  asset_info: AssetInfo;
  count_of_vuln_by_scanner: CountOfVulnByScanner;
  past_vuln_info: PastVulnInfo;
  top_ten_vuln_dependencies: TopTenVulnDependencies;
  top_ten_vuln_class: TopTenVulnClass;
  top_ten_secret_scanning_tags: TopTenSecretScanningTags;
  top_ten_repos_with_highest_vuln: TopTenReposWithHighestVuln;
  monthly_report: MonthlyReport;
  vuln_age: VulnAge;
  latest_vulnerability?: ScannerResultsEntity[];
}

export interface SastScaSsTrend {
  sca_0_to_14_vulns: number;
  sca_15_to_30_vulns: number;
  sca_31_to_60_days: number;
  sca_61_to_90_days: number;
  sca_90plus_days: number;
  sast_0_to_14_vulns: number;
  sast_15_to_30_vulns: number;
  sast_31_to_60_days: number;
  sast_61_to_90_days: number;
  sast_90plus_days: number;
  ss_0_to_14_vulns: number;
  ss_15_to_30_vulns: number;
  ss_31_to_60_days: number;
  ss_61_to_90_days: number;
  ss_90plus_days: number;
}
export interface ScaPubExploitTrend {
  zero_to_thirty_day_public_exploit: number;
  thirty_to_ninety_day_public_exploit: number;
  ninety_to_oneeighty_day_public_exploit: number;
  oneightyplus_day_public_exploit: number;
  zero_to_thirty_day_no_public_exploit: number;
  thirty_to_ninety_day_no_public_exploit: number;
  ninety_to_oneeighty_day_no_public_exploit: number;
  oneightyplus_day_public_no_exploit: number;
}
export interface ScanInfo {
  scan_success_count: number;
  scan_fail_count: number;
  total_scan_count: number;
}
export interface AssetInfo {
  total_assets: number;
  total_assets_in_7_days: number;
  total_assets_in_30_days: number;
}
export interface CountOfVulnByScanner {
  total_sast_reports: number;
  total_sca_reports: number;
  total_secrets_scanning_reports: number;
}
export interface PastVulnInfo {
  total_vuln: number;
  total_results_in_7_days: number;
  total_results_in_30_days: number;
}
export interface TopTenVulnDependencies {
  top_ten_vuln_dependencies?: TopTenVulnDependenciesEntity[];
}
export interface TopTenVulnDependenciesEntity {
  dependency: string;
  count: number;
}
export interface TopTenVulnClass {
  top_ten_vuln_class?: TopTenVulnClassEntity[];
}
export interface TopTenVulnClassEntity {
  vuln_class: string;
  count: number;
}
export interface TopTenSecretScanningTags {
  top_ten_secret_scanning_tags?: TopTenSecretScanningTagsEntity[];
}
export interface TopTenSecretScanningTagsEntity {
  secret_scan_tags: string;
  count: number;
}
export interface TopTenReposWithHighestVuln {
  top_ten_repos_with_highest_vuln?: TopTenReposWithHighestVulnEntity[];
}
export interface TopTenReposWithHighestVulnEntity {
  vuln_by_repo: string;
  count: number;
}
export interface MonthlyReport {
  vulnerability_trend?: VulnerabilityTrendEntity[];
}
export interface VulnerabilityTrendEntity {
  name: string;
  SAST: number;
  SCA: number;
  SS: number;
}
export interface VulnAge {
  total_vuln_not_fixed_in_seven_days: number;
  total_vuln_not_fixed_in_thirty_days: number;
  total_vuln_not_fixed_in_sixty_days: number;
  total_vuln_not_fixed_in_ninety_days: number;
}
