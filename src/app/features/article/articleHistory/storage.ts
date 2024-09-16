export interface ArticleHistoryStorageItem {
  time: number;
  lid: string;
  forProblem?: string;
  name: string;
  status: string | true;
}

export interface ArticleHistoryStorage {
  kpi: number;
  history: ArticleHistoryStorageItem[];
}

const StorageKey = 'articleHistory' as const;

export function getHistoryStorage() {
  return (
    (JSON.parse(
      localStorage.getItem(StorageKey) || 'null'
    ) as ArticleHistoryStorage) ||
    ({ kpi: 0, history: [] } satisfies ArticleHistoryStorage)
  );
}

export function setHistoryStorage(data: ArticleHistoryStorage) {
  localStorage.setItem(StorageKey, JSON.stringify(data));
}

export function appendHistoryStorage(...item: ArticleHistoryStorageItem[]) {
  const storage = getHistoryStorage();
  storage.history.push(...item);
  ++storage.kpi;
  setHistoryStorage(storage);
}
