import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { SWRConfiguration } from 'swr';

export const getRequestOptions: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: false,
};

/**
 * @info provides configuration for swr @global level
 * @returns SWRConfiguration
 */
export const useSWRConfig: () => { swrOptions: SWRConfiguration } = () => {
  return {
    swrOptions: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: true,

      fetcher: (url, params) =>
        axios({
          ...getRequestOptions,
          url,
          params: {
            ...params,
          },
        })
          .then((res) => res.data)
          .catch((e) => {
            if (e.response.status === 401) {
              //  signout()
            } else {
              throw e;
            }
          }),
    },
  };
};
