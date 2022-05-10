import type { FC } from 'react';
import type { SastScaSsTrend } from '../../api-routes/types/dashboard';

const ScanTrendView: FC<{ data: SastScaSsTrend | undefined }> = ({ data }) => {
  return (
    <div className="w-full chart-card text-gray-50 p-y-2">
      <h3 className="text-white text-lg cut-text-one mb-3">
        {'Vulnerability Age'}
      </h3>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3   text-left text-xs font-semibold uppercase"></th>
                <th className="px-5 py-3 bg-teal-700/50  border  border-gray-200 text-left text-xs font-semibold uppercase">
                  90+ Days
                </th>
                <th className="px-5 py-3 bg-teal-700/50 border  border-gray-200  text-left text-xs font-semibold uppercase">
                  61-90 Days
                </th>
                <th className="px-5 py-3 bg-teal-700/50 border  border-gray-200  text-left text-xs font-semibold uppercase">
                  31-60 Days
                </th>
                <th className="px-5 py-3 bg-teal-700/50 border border-gray-200 text-left text-xs font-semibold uppercase">
                  15-30 Days
                </th>

                <th className="px-5 py-3 bg-teal-700/50  border-y border-gray-200 text-left text-xs font-semibold uppercase">
                  0-14 Days
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-5 py-3 border-b border-gray-200  text-sm bg-amber-600">
                  <p>SAST</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.sast_90plus_days}</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.sast_61_to_90_days}</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.sast_31_to_60_days}</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.sast_15_to_30_vulns}</p>
                </td>
                <td className="px-5 py-3 border-b border-gray-200  text-sm">
                  <p>{data?.sast_0_to_14_vulns}</p>
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 border-b border-gray-200  text-sm bg-sky-600">
                  <p>SS</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.ss_90plus_days}</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.ss_61_to_90_days}</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.ss_31_to_60_days}</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.ss_15_to_30_vulns}</p>
                </td>
                <td className="px-5 py-3 border-b border-gray-200  text-sm">
                  <p>{data?.ss_0_to_14_vulns}</p>
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 border-b border-gray-200  text-sm bg-fuchsia-600">
                  <p>SCA</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.sca_90plus_days}</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.sca_61_to_90_days}</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.sca_31_to_60_days}</p>
                </td>
                <td className="px-5 py-3 border border-gray-200  text-sm">
                  <p>{data?.sca_15_to_30_vulns}</p>
                </td>
                <td className="px-5 py-3 border-b border-gray-200  text-sm">
                  <p>{data?.sca_0_to_14_vulns}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScanTrendView;
