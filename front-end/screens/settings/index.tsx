import type { FC } from 'react';
import { Fragment } from 'react';
import useSWR from 'swr';
import { apiRoutes } from '../../api-routes';
import type { SettingResponse } from '../../api-routes/types';
import SectionTitle from '../../components/shared/section-heading';
import JiraConfig from './jira';
import SlackConfig from './slack';

const SettingsView: FC = () => {
  const { isValidating, data, error } = useSWR<SettingResponse>(
    apiRoutes.getSettings,
  );

  if (isValidating) {
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
    <Fragment>
      <SectionTitle title="Settings" showDivider={true} />
      <JiraConfig data={data} />
      <SlackConfig data={data} />
    </Fragment>
  );
};

export default SettingsView;
