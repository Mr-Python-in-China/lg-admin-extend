import React from 'react';
import {
  ArticleHistoryStorageItem,
  getHistoryStorage,
  setHistoryStorage
} from './storage';
import { Button, Card, Input, Link } from '@fluentui/react-components';
import useRefreshHook from '../../../refreshHook';
import { formatTime } from '../../../utils';
import { Delete24Regular } from '@fluentui/react-icons';

function HistoryItem({
  item,
  onDelete
}: {
  item: ArticleHistoryStorageItem;
  onDelete?: () => void;
}) {
  return (
    <Card
      onClick={() => open('https://www.luogu.com.cn/article/' + item.lid)}
      floatingAction={
        <Button
          appearance="subtle"
          icon={
            <Button
              appearance="subtle"
              aria-label="Delete"
              icon={<Delete24Regular />}
              onClick={e => {
                e.stopPropagation();
                onDelete && onDelete();
              }}
            />
          }
        />
      }
    >
      <div className="articleHistoryItemCardName">{item.name}</div>
      <div>
        {item.status === true ? '通过' : '拒绝：' + item.status} @{' '}
        {formatTime(item.time)}
      </div>
      {item.forProblem && (
        <div>
          关联于题目{' '}
          <Link
            href={'https://www.luogu.com.cn/problem/' + item.forProblem}
            target="_blank"
            onClick={e => e.stopPropagation()}
          >
            {item.forProblem}
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function ArticleHistory() {
  const data = getHistoryStorage();
  const refresh = useRefreshHook();
  return (
    <>
      <div className="articleHistoryKpiDiv">
        KPI：
        <Input
          type="number"
          step={1}
          value={data.kpi.toString()}
          onChange={(_, d) => (
            setHistoryStorage({
              kpi: Math.floor(Number(d.value)),
              history: data.history
            }),
            refresh()
          )}
        />
      </div>
      <div className="articleHistoryItemDiv">
        {data.history.reverse().map((item, index) => (
          <HistoryItem
            item={item}
            onDelete={() => {
              data.history.splice(index, 1);
              setHistoryStorage(data);
              refresh();
            }}
            key={index}
          />
        ))}
      </div>
    </>
  );
}
