import Image from 'next/image';
import type { FC } from 'react';
import { useState } from 'react';
import type { SettingResponse } from '../../api-routes/types';

const SlackConfig: FC<{ data?: SettingResponse }> = ({ data }) => {
  const [values, setValues] = useState<
    Omit<SettingResponse, 'Jira_url' | 'Jira_project' | 'Jira_token'>
  >({
    Slack_Webhook_Url: data?.Slack_Webhook_Url || '',
  });

  return (
    <div className="border text-gray-50 border-opacity-40 rounded-md mt-4">
      <div className="p-2 sm:p-3 border-b border-opacity-40">
        <div className="md:flex items-center gap-x-3 mb-3">
          <div className="border p-2 border-opacity-40 rounded-lg w-fit md:mb-0 mb-2">
            <Image
              src={'/assets/slack.png'}
              layout="fixed"
              alt="..."
              width={80}
              height={80}
            />
          </div>
          <div>
            <h3 className="font-semibold text-xl mb-1">{'Slack'}</h3>
            <p className="text-gray-50/80">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Placeat
              at doloremque quasi tempora dicta veritatis magnam. Nam
              consequuntur illo aliquam pariatur asperiores optio! Atque vel
              eaque molestias fugit mollitia reiciendis?
            </p>
          </div>
        </div>
      </div>
      <div className="p-2 sm:p-3 grid lg:grid-cols-2 grid-cols-1 gap-2 lg:gap-x-10 ">
        <div className="flex flex-col gap-1.5 lg:mb-0 mb-2">
          <label htmlFor="token">Slack Webhook URL</label>
          <input
            value={values?.Slack_Webhook_Url}
            onChange={(e) => {
              setValues((current) => ({
                ...current,
                Slack_Webhook_Url: e.target.value,
              }));
            }}
            type="text"
            className="bg-transparent border-opacity-60 border  w-full p-2 rounded-md"
          />
        </div>
      </div>
      <div className="p-2 sm:p-3  mb-3">
        <button className="w-36 border  py-2 px-4 bg-blue-600 rounded-lg hover:bg-blue-600/40">
          Save
        </button>
      </div>
    </div>
  );
};

export default SlackConfig;
