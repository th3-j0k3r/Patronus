import { ResponsiveBar } from '@nivo/bar';
import type { Margin } from '@nivo/core';
import randomColor from 'randomcolor';
import type { FC } from 'react';
import { darkThemeColorPalette } from '../../configs';

interface BarChartProps {
  data: { [key: string]: string | number }[];
  title: string;
  keysNames: { bottom: string; left: string };
  comparekeys: string[];
  indexKey: string;
  /**
   * @default 288px
   * @optinal
   */
  chartHeightInPx?: number;
  margin?: Partial<Margin> | undefined;
}

const BarChart: FC<BarChartProps> = ({
  data,
  title,
  keysNames,
  chartHeightInPx = 288,
  comparekeys,
  indexKey,
  margin,
}) => {
  return (
    <div className="chart-card overflow-hidden">
      <h3 className="text-white text-lg cut-text-one mb-3">{title}</h3>
      <div style={{ height: `${chartHeightInPx}px` }}>
        <ResponsiveBar
          theme={{ textColor: '#fff' }}
          data={[
            ...(data?.map((datum, index) => ({
              ...datum,
              color:
                index < darkThemeColorPalette.length
                  ? darkThemeColorPalette[index]
                  : randomColor(),
            })) as any),
          ]}
          layout="horizontal"
          keys={comparekeys}
          indexBy={indexKey}
          colors={(bar) => bar.data.color as string}
          margin={margin}
          animate={true}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -10,
            legend: keysNames.bottom,
            legendPosition: 'middle',
            legendOffset: margin?.bottom ? margin.bottom - 8 : 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -20,
            legend: keysNames.left,
            legendPosition: 'middle',
            legendOffset: -(margin?.left ? margin.left - 5 : 0),
          }}
          enableGridY={false}
          labelSkipWidth={2}
          labelSkipHeight={2}
          labelTextColor={'#fff'}
          role="application"
          isInteractive={true}
          tooltip={({ data }) => {
            return (
              <div className="p-2 bg-white rounded bg-opacity-80 text-gray-600">
                {Object.keys(data).map((key) => {
                  if (key === 'color') {
                    return null;
                  }

                  return (
                    <div className="flex items-center" key={key}>
                      <p className="font-semibold">{key}</p>
                      <p className="ml-2">{data[key]}</p>
                    </div>
                  );
                })}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default BarChart;
