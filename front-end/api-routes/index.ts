import { ScanSearchOptions } from '../types/globals';

export const apiRoutes = {
  /**
   * @description gets all assets from db.
   * @queryParams {page_num:number,language:string,filter:responsefield,order:asc|desc}
   * @returns AssetsResponse
   */
  getListOfAssets: `/assets`,

  /**
   * @description gets searched assets from db.
   * @returns AssetsResultsEntity[]
   */
  assetSearch: `/asset_search`,

  /**
   * @description gets scanned results from db.
   * @queryParams
   * @returns ScannerResponse
   */
  getScannedResults: (type: 'sca' | 'sast' | 'ss') =>
    `/results?scanner=${type}`,

  /**
   * @description sends list of to be resolved ids to backend.
   * @method POST
   */
  resolveTheScannedResults: `/resolve`,

  /**
   * @description sends list of to be suppressed ids to backend.
   * @method POST
   */
  markScannedResultsAsFalsePositive: `/suppress`,

  /**
   *@method GET
   * @param repoName string
   * @param id strinf
   * @returns result:{ScannerResultsEntity}
   */
  getIndividualScannedResponse: (repoName: string, id: string) =>
    `/result/${repoName}/${id}`,

  /**
   * @desc search sca results
   * @method GET
   */
  searchScannedResults: (
    type: 'sca' | 'sast' | 'ss',
    filter: ScanSearchOptions,
    searchTerm: string,
  ) => `/results_search_${type}?${filter}=${searchTerm}`,

  /**
   *@method GET
   * @param repoName string
   * @returns repos : string[]
   */
  getRepos: (name: string) => `/getrepos?repo_name=${name}`,

  /**
   *@method GET
   * @param repoName string
   * @returns repos : string[]
   */
  getBranches: (name: string) => `/getbranches?repo_name=${name}`,

  /**
    @method POST
    @body {
      reponame:string
      branch:string
      scan_type:string
      author:string
    }
    @returns OnDemandInitiateResponse
  */
  initiateOnDemandScan: `/ondemandscan`,

  /**
    @method GET
    @returns OnDemandScanResponse
  */
  getOnDemandScan: `/ondemandscan`,

  /**
   * @method GET
   * @returns ScannerResponse
   */
  getOnDemandScannedResults: `/invoke_results`,

  /**
   * @description data for home page
   * @method GET
   * @returns DashboardResponse
   */
  getDashBoardData: `/`,

  /**
   * @method GET
   * @returns SettingResponse
   */
  getSettings: `/settings_page`,

  /**
   * @method POST
   * @description checks list of available cve from db
   * @returns string[]
   */
  checkCVEExists: `/check_cve_exists`,

  raiseJiraTicket: `/raisejira`,
};
