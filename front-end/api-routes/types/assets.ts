export interface AssetsResponse {
  results: AssetsResultsEntity[];
  has_prev: boolean;
  has_next: boolean;
  next_num: number;
  top_ten_languages: TopTenLanguages;
  top_ten_images: TopTenImages;
  prev_page_count: number;
}

export interface AssetsResultsEntity {
  language?: string | null;
  owner?: null;
  last_commit_date: string;
  creation_date: string;
  asset_id: string;
  asset_name: string;
  image_name?: string | null;
}

export interface TopTenLanguages {
  top_ten_asset_languages?: TopTenAssetLanguagesEntity[] | null;
}

export interface TopTenAssetLanguagesEntity {
  language: string;
  count: number;
}

export interface TopTenImages {
  top_ten_image_name?: TopTenImageNameEntity[] | null;
}

export interface TopTenImageNameEntity {
  image: string;
  count: number;
}
