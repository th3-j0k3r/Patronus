import axios from 'axios';
import { apiRoutes } from '../../api-routes';
import { getRequestOptions } from '../../hooks/useSWRConfig';

export const markAsResolved = async (scanIds: string[]) => {
  try {
    const formData: string[] = [];

    scanIds.forEach((id) => {
      formData.push('multiresolve=' + id);
    });

    await axios.post(apiRoutes.resolveTheScannedResults, formData.join('&'), {
      ...getRequestOptions,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return { isResolved: true, message: 'Success' };
  } catch (error) {
    console.log(error);
    return { isResolved: false, message: error };
  }
};

export const markAsFalsePositive = async (scanIds: string[]) => {
  try {
    const formData: string[] = [];

    scanIds.forEach((id) => {
      formData.push('multiresolve=' + id);
    });

    await axios.post(
      apiRoutes.markScannedResultsAsFalsePositive,
      formData.join('&'),
      {
        ...getRequestOptions,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return { isFalsePositive: true, message: 'Success' };
  } catch (error) {
    console.log(error);
    return { isFalsePositive: false, message: error };
  }
};

export const raiseJiraTicket = async (scanId: string) => {
  try {
    const formData: string[] = [];

    formData.push('multiresolve=' + scanId);

    await axios.post(apiRoutes.raiseJiraTicket, formData.join('&'), {
      ...getRequestOptions,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return { isFalsePositive: true, message: 'Success' };
  } catch (error) {
    console.log(error);
    return { isFalsePositive: false, message: error };
  }
};
