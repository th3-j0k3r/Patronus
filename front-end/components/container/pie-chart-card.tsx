import { ResponsivePie } from '@nivo/pie';
import type { FC } from 'react';
import { darkThemeColorPalette } from '../../configs';
import ScaleUpAnimationWrapper from '../shared/animation/scale-up-animation-wrapper';

interface PieChartCardProps {
  data: {
    id: string;
    label: string;
    value: number;
    color?: string;
  }[];
  title: string;
  showLegend?: boolean;
}

const PieChartCard: FC<PieChartCardProps> = ({
  data,
  title,
  showLegend = false,
}) => {
  return (
    <ScaleUpAnimationWrapper>
      <div
        className={`chart-card p-3 lg:pb-8 pb-10 mt-4  ${
          showLegend ? 'grid grid-cols-3' : ''
        }`}
      >
        <div className="h-72 col-span-2">
          <h3 className="text-white text-lg  cut-text-1 mb-2" title={title}>
            {title}
          </h3>
          {data.length ? (
            <ResponsivePie
              data={data}
              theme={{
                textColor: '#fff',
              }}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              startAngle={-180}
              sortByValue={false}
              innerRadius={0.5}
              arcLabel="value"
              padAngle={1}
              animate={true}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={darkThemeColorPalette}
              borderWidth={1}
              borderColor={{ theme: 'grid.line.stroke' }}
              enableArcLinkLabels={false}
              motionConfig={{
                mass: 14,
                tension: 170,
                friction: 26,
                clamp: false,
                precision: 0.01,
                velocity: 0,
              }}
              transitionMode="pushIn"
            />
          ) : (
            <p className="text-white mt-2">No result found</p>
          )}
        </div>
        {showLegend ? (
          <div className="w-full h-64 text-gray-50 flex items-center mt-8 overflow-auto hide-scroll-bar">
            <div>
              {data.map((each) => {
                return (
                  <div key={each.id} className="flex items-center py-1">
                    <span
                      className="w-3 h-3  rounded-full mr-2"
                      style={{ backgroundColor: each.color }}
                    ></span>
                    <small className="cut-text-1" title={each.id}>
                      {each.id.split('/')[1] || each.id.split('/')[0]}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    </ScaleUpAnimationWrapper>
  );
};

export default PieChartCard;
