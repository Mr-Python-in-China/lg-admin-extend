import Axios, { AxiosRequestConfig, CancelToken } from 'axios';
import GMadaptr from '@mr.python/axios-userscript-adapter';

import { AdminMeta, SolutionAdminInfo } from '../interface';

const axios = Axios.create({
  baseURL: 'https://www.luogu.com.cn/sadmin',
  adapter: GMadaptr
});

axios.interceptors.response.use(v => {
  if (typeof v.data === 'object' && v.data.retry)
    return axios.request(v.config);
  else return v;
});

GM_xmlhttpRequest; // add it to @grant

export const fetchMyInfo = () =>
  axios
    .get<AdminMeta>('https://www.luogu.com.cn/sadmin', {
      headers: {
        'x-lentille-request': 'content-only'
      }
    })
    .then(x => {
      if (!x.data.user) throw new Error('unknown user', { cause: x });
      return x.data.user;
    });

export const getArticle = (skipBefore: number, config?: AxiosRequestConfig) =>
  axios
    .post<SolutionAdminInfo>('api/article/promotionReview/next', undefined, {
      params: {
        skipBefore: skipBefore || 0
      },
      ...config
    })
    .then(x => x.data);

export const submitArticleCheckResult = (...data: [string, string | true][]) =>
  axios
    .post<{
      rejected: string[];
      accepted: string[];
    }>(
      'https://www.luogu.com.cn/sadmin/api/article/promotionReview/submit',
      Object.fromEntries<string | true>(data)
    )
    .then(x => x.data);
