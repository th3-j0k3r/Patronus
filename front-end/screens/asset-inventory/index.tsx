import type { FC } from 'react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiRoutes } from '../../api-routes';
import type { AssetsResponse } from '../../api-routes/types/assets';
import PieChartCard from '../../components/container/pie-chart-card';
import FadeTransition from '../../components/shared/animation/fade-transition';
import SectionTitle from '../../components/shared/section-heading';
import { darkThemeColorPalette } from '../../configs';
import type { AssetInventoryFilterType } from '../../types/globals';
import TableDataView from './table-data';

const AssetInventoryView: FC = () => {
  const [assetTablePageNumber, setAssetTablePageNumber] = useState<number>(1);
  const [assetsData, setAssetsData] = useState<AssetsResponse>();
  const [filterBy, setFilterBy] = useState<AssetInventoryFilterType>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const { isValidating, data, error } = useSWR<AssetsResponse>(
    apiRoutes.getListOfAssets +
      `?page_num=${assetTablePageNumber}${
        filterBy ? `&filter=${filterBy}&order=${order}` : ''
      }`,
  );

  useEffect(() => {
    let isCancelled = false;
    if (!isCancelled && data) {
      setAssetsData(data);
    }
    return () => {
      isCancelled = true;
    };
  }, [data]);

  if (isValidating && !assetsData) {
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
    <FadeTransition>
      <SectionTitle title="Asset Inventory" showDivider={true} />

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <PieChartCard
          showLegend={true}
          data={
            assetsData?.top_ten_languages.top_ten_asset_languages?.map(
              ({ count, language }, index) => {
                return {
                  id: language,
                  label: language,
                  value: count,
                  color: darkThemeColorPalette[index],
                };
              },
            ) || []
          }
          title="Top Languages"
        />
        <PieChartCard
          showLegend={true}
          data={
            assetsData?.top_ten_images.top_ten_image_name?.map(
              ({ count, image }, index) => ({
                id: image,
                label: image,
                value: count,
                color: darkThemeColorPalette[index],
              }),
            ) || []
          }
          title="Top Ten Images Being Used"
        />
      </div>

      <TableDataView
        data={assetsData}
        assetTablePageNumber={assetTablePageNumber}
        setAssetTablePageNumber={setAssetTablePageNumber}
        setFilterBy={setFilterBy}
        filterBy={filterBy}
        setOrder={setOrder}
        order={order}
      />
    </FadeTransition>
  );
};

export default AssetInventoryView;
