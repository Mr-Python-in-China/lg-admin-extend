import { useReducer } from 'react';

export default function useRefreshHook() {
  const [, forceRerender] = useReducer(x => !x, false);
  return () => forceRerender();
}
