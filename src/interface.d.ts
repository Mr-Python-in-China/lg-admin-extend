import {
  Article,
  ArticleDetails,
  LentilleDataResponse,
  ProblemSummary
} from 'luogu-api';

export interface ArticleWithAdmin extends ArticleDetails {
  contentFull: true;
  adminComment: string;
  promotePreviousAccepted: null;
  promoteStatusChanged: number;
  promoteResult: {
    updateAt: number;
  };
}

export type SolutionAdminInfo =
  | {
      article: ArticleWithAdmin;
      count: Exclude<number, 0>;
      countForProblem: {
        pending: number;
        available: number;
      } | null;
    }
  | { article: null; count: 0; countForProblem: null };

export type AdminMeta = LentilleDataResponse<{ ':': 0 }>;
