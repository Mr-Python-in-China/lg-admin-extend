import Axios, { AxiosRequestConfig, CancelToken } from 'axios';
import GMadaptr from '@mr.python/axios-userscript-adapter';

import { AdminMeta, SolutionAdminInfo } from '../interface';
import deepmerge from 'deepmerge';
import { DataResponse, ProblemData } from 'luogu-api';

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

export const fetchMyInfo = (config: AxiosRequestConfig = {}) =>
  axios
    .get<AdminMeta>(
      'https://www.luogu.com.cn/sadmin',
      deepmerge(
        {
          headers: {
            'x-lentille-request': 'content-only'
          }
        },
        config
      )
    )
    .then(x => {
      if (!x.data.user) throw new Error('unknown user', { cause: x });
      return x.data.user;
    });

export const getArticle = (
  skipBefore: number,
  category: number[] = [],
  config: AxiosRequestConfig = {}
) =>
  axios
    .post<SolutionAdminInfo>(
      'api/article/promotionReview/next',
      undefined,
      deepmerge(
        {
          params: {
            skipBefore: skipBefore || 0,
            category: category.join(',')
          }
        },
        config
      )
    )
    .then(x => x.data);

export const submitArticleCheckResult = (
  data: [string, string | true][],
  config: AxiosRequestConfig = {}
) =>
  axios
    .post<{
      rejected: string[];
      accepted: string[];
    }>(
      'https://www.luogu.com.cn/sadmin/api/article/promotionReview/submit',
      Object.fromEntries<string | true>(data),
      config
    )
    .then(x => x.data);

export const getProblemData = (pid: string, config: AxiosRequestConfig = {}) =>
  axios
    .get<
      DataResponse<ProblemData>
    >(`https://www.luogu.com.cn/problem/${pid}`, deepmerge({ headers: { 'x-luogu-type': 'content-only' } }, config))
    .then(x => x.data);
