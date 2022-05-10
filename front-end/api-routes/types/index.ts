export interface OnDemandInitiateResponse {
  'Queue Length': number;
  Task_ID: string;
}

export interface OnDemandScanResponse {
  results?: OnDemandScanEntity[];
  has_prev: boolean;
  has_next: boolean;
  next_num?: null;
}
export interface OnDemandScanEntity {
  scan_type: string;
  scan_start_time: string;
  scan_id: string;
  reponame: string;
  branch: string;
  author: string;
  scan_successful: boolean;
  scan_end_time?: string | null;
  invoke_type: string;
  scan_invoke_id: string;
}

export interface SettingResponse {
  Jira_token: string;
  Jira_url: string;
  Jira_project: string;
  Slack_Webhook_Url: string;
}

export interface CommonVulnerabilitiesandExposuresTrendResponse {
  data?: CommonVulnerabilitiesandExposuresTrendDataEntity[] | null;
  latest_client_version: string;
  updated: string;
}
export interface CommonVulnerabilitiesandExposuresTrendDataEntity {
  assigner?: string | null;
  audience_size: number;
  cve: string;
  cve_urls?: null;
  cvssv2_base_score?: number | null;
  cvssv2_severity?: string | null;
  cvssv3_base_score?: number | null;
  cvssv3_base_severity?: string | null;
  cwes?: (CwesEntity | null)[] | null;
  description?: string | null;
  epss_score?: string | null;
  github_repos?: (GithubReposEntity | null)[] | null;
  lastModifiedDate?: string | null;
  num_retweets: number;
  num_tweets: number;
  num_tweets_and_retweets: number;
  publishedDate?: string | null;
  reddit_posts?: (RedditPostsEntity | null)[] | null;
  score?: number | null;
  severity?: string | null;
  tweets?: TweetsEntity[] | null;
  vendor_advisories?: (string | null)[] | null;
  vendors?: (VendorsEntity | null)[] | null;
}
export interface CwesEntity {
  cwe_description: string;
  cwe_id: string;
}
export interface GithubReposEntity {
  created: string;
  description: string;
  language?: string | null;
  name: string;
  stars: number;
  topics?: (string | null)[] | null;
  updated: string;
  url: string;
}
export interface RedditPostsEntity {
  created: number;
  is_self: boolean;
  num_comments: number;
  reddit_url: string;
  subreddit: string;
  subreddit_subscribers: number;
  title: string;
  upvotes: number;
  url: string;
}
export interface TweetsEntity {
  created_at: string;
  likes: number;
  num_retweets: number;
  retweets: number;
  tweet_id: string;
  tweet_text: string;
  twitter_user_handle: string;
  twitter_user_name: string;
  twitter_user_profile_pic: string;
  urls?: (UrlsEntity | null)[] | null;
}
export interface UrlsEntity {
  display_url: string;
  expanded_url: string;
  url: string;
}
export interface VendorsEntity {
  products?: ProductsEntity[] | null;
  vendor: string;
}
export interface ProductsEntity {
  product: string;
  versions?: string[] | null;
}
