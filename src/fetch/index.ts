import Axios from 'axios';
import GMadaptr from '@mr.python/axios-userscript-adapter';

import { AdminMeta, SolutionAdminInfo } from '../interface';

const axios = Axios.create({
  baseURL: 'https://www.luogu.com.cn/sadmin',
  adapter: GMadaptr
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

export const getArticle = (skipBefore?: number) =>
  axios
    .post<SolutionAdminInfo>('api/article/promotionReview/next', undefined, {
      params: {
        skipBefore: skipBefore || 0
      }
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
