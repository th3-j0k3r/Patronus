import { ResponsiveBar } from '@nivo/bar';
import randomColor from 'randomcolor';
import type { FC } from 'react';
import type { SimilarVulns } from '../../../api-routes/types/scanner';
import { darkThemeColorPalette } from '../../../configs';

const Occurrence: FC<{ data: SimilarVulns }> = ({ data }) => {
  return (
    <div
      className="grid grid-cols-1 gap-4 text-gray-50 mb-4  bg-surface-md-dark
      border-gray-50 border border-opacity-20     rounded-md overflow-hidden"
    >
      <div className="chart-card p-3 lg:pb-8 pb-10 ">
        <div className="h-64 pb-3">
          <h3 className="text-white text-lg cut-text-one mb-3">
            Top 5 similar occurrence across org
          </h3>
          <ResponsiveBar
            theme={{ textColor: '#fff' }}
            data={[
              ...(data.similar_vuln_data?.map((datum, index) => ({
                ...datum,
                color:
                  index < darkThemeColorPalette.length
                    ? darkThemeColorPalette[index]
                    : randomColor(),
              })) as any),
            ]}
            keys={['count']}
            indexBy="project_name"
            colors={(bar) => bar.data.color as string}
            margin={{
              top: 10,
              right: 0,
              bottom: 50,
              left: 50,
            }}
            animate={false}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -10,
              legend: 'Project',
              legendPosition: 'middle',
              legendOffset: 38,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -20,
              legend: 'Count',
              legendPosition: 'middle',
              legendOffset: -40,
            }}
            enableGridY={false}
            labelSkipWidth={9}
            labelSkipHeight={12}
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
    </div>
  );
};

export default Occurrence;
