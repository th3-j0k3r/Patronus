import axios from 'axios';
import { apiRoutes } from '../api-routes';
import type { DashboardResponse } from '../api-routes/types/dashboard';
import { getRequestOptions } from '../hooks/useSWRConfig';

export class HTTPService {
  static async getDashboardData() {
    try {
      const { data } = await axios.get<DashboardResponse>(
        apiRoutes.getDashBoardData,
        { ...getRequestOptions },
      );

      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
