import { UserSummary } from 'luogu-api';
import { createNotUndefinedContext } from '../notUndefinedContext';

export const MyInfoContext = createNotUndefinedContext<UserSummary>();
