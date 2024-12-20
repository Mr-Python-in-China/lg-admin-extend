import { SolutionAdminInfo } from '../../../interface';
import React, { useEffect, useState } from 'react';
import ArticleViewer from './articleViewer';
import {
  Button,
  Field,
  Spinner,
  Textarea,
  Text,
  Link,
  Switch,
  Input,
  InfoLabel,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  HistoryDismiss32Filled
} from '@fluentui/react-icons';
import dayjs from 'dayjs';
import emptyQueueImage from 'assets/emptyQueue.webp';
import { isCancel } from 'axios';
import { useNotUndefinedContext } from '../../../notUndefinedContext';
import { MyInfoContext } from '../../contexts';
import { ArticleCategory, oldDifficultySystem } from '../../../constants';
import { getArticle, submitArticleCheckResult } from '../../../fetch';
import {
  ErrorDiv,
  formatTime,
  InputDateTime,
  ProblemNameWithDifficulty,
  UserName
} from '../../utils';
import ArticleHistory from './articleHistory';

import './style.css';
import { appendHistoryStorage } from './articleHistory/storage';

export default function Article() {
  const [status, setStatus] = useState<{
    details: SolutionAdminInfo;
    submiting?: boolean;
  } | null>(null);
  const { details } = status || { details: null };
  const [fetchError, setFetchError] = useState<unknown | undefined>(undefined);
  const [skipBefore, setSkipBefore] = useState<number>(0);
  const [otherRefuseCommit, setOtherRefuseCommit] = useState('');
  const [showAdminInfo, setShowAdminInfo] = useState(true);
  const [viewSourceCode, setViewSourceCode] = useState(false);
  const myProfile = useNotUndefinedContext(MyInfoContext);
  const [showHistory, setShowHistory] = useState(false);
  const [solutionOnly, setSolutionOnly] = useState(true);

  let refuseCommit = otherRefuseCommit;
  if (refuseCommit)
    if (showAdminInfo)
      refuseCommit += `。审核管理员：${myProfile.name}，对审核结果有疑问请私信交流`;

  useEffect(() => {
    const cancel = new AbortController();
    getArticle(skipBefore / 1000, solutionOnly ? [2] : [], {
      signal: cancel.signal
    })
      .then(v => {
        setStatus({ details: v }),
          v.article && setSkipBefore(v.article.promoteResult.updateAt * 1000);
      })
      .catch(e => {
        if (isCancel(e)) return;
        console.error('Error in feature Article', e), setFetchError(e);
      });
    return () => void cancel.abort();
  }, []);
  function updateArticle() {
    setStatus(null);
    getArticle(skipBefore / 1000, solutionOnly ? [2] : [])
      .then(v => {
        setStatus({ details: v });
        if (v.article) setSkipBefore(v.article.promoteResult.updateAt * 1000);
      })
      .catch(
        e => (console.error('Error in feature Article', e), setFetchError(e))
      );
  }
  async function submit() {
    if (!details?.article) throw new Error('No article');
    setStatus({ details: details, submiting: true });
    await submitArticleCheckResult([
      [details.article.lid, refuseCommit || true]
    ]);
    appendHistoryStorage({
      time: Date.now(),
      lid: details.article.lid,
      name: details.article.title,
      status: refuseCommit || true,
      forProblem: details.article.solutionFor?.pid
    });
    setStatus(null);
    setOtherRefuseCommit('');
    updateArticle();
  }
  function addCommit(s: string) {
    setOtherRefuseCommit(
      otherRefuseCommit +
        (otherRefuseCommit === '' || /。|；|，|？|！$/.test(otherRefuseCommit)
          ? ''
          : '；') +
        s
    );
  }

  return !fetchError ? (
    <div className="articleFeature">
      {details ? (
        details.article ? (
          <>
            <pre
              className="articleViewer"
              style={{ display: viewSourceCode ? 'block' : 'none' }}
            >
              <code>{details.article.content}</code>
            </pre>
            <div
              className="articleViewer"
              style={{ display: viewSourceCode ? 'none' : 'block' }}
            >
              <ArticleViewer
                markdown={details.article.content}
                addCommit={addCommit}
              />
            </div>
          </>
        ) : (
          <div className={'articleViewer articleQueueEmpty'}>
            <img src={emptyQueueImage} width={300} />
            <span>审核队列被清空啦！</span>
          </div>
        )
      ) : (
        <Spinner className="articleViewer" size="huge" />
      )}
      <div className="articleInfo">
        {details?.article ? (
          <>
            <Text as="strong" size={500} weight="bold">
              {details.article.title}
            </Text>
            <Text>
              用户 <UserName>{details.article.author}</UserName> 创建于{' '}
              <time dateTime={formatTime(details.article.time * 1000)}>
                {formatTime(details.article.time * 1000)}
              </time>
              {details.article.promoteResult.updateAt && (
                <>
                  ，提交于{' '}
                  <time
                    dateTime={dayjs(
                      details.article.promoteResult.updateAt * 1000
                    ).format('YYYY/MM/DD HH:mm:ss')}
                  >
                    {dayjs(
                      details.article.promoteResult.updateAt * 1000
                    ).format('YYYY/MM/DD HH:mm:ss')}
                  </time>
                </>
              )}
              。文章 LID：
              <Link
                href={`https://www.luogu.com.cn/article/${details.article.lid}`}
                target="_blank"
              >
                {details.article.lid}
              </Link>
            </Text>
            <Text>
              文章分类：{ArticleCategory[details.article.category]}。
              {details.article.solutionFor && (
                <>
                  关联于题目{' '}
                  <ProblemNameWithDifficulty
                    pid={details.article.solutionFor.pid}
                    name={details.article.solutionFor.title}
                    difficulty={oldDifficultySystem.findIndex(
                      x => x >= details.article.solutionFor!.difficulty
                    )}
                  />
                  。
                  {details.countForProblem && (
                    <>
                      共有 {details.countForProblem.pending} 篇待审核题解，
                      {details.countForProblem.available} 篇
                      <Link
                        href={`https://www.luogu.com.cn/problem/solution/${details.article.solutionFor.pid}`}
                        target="_blank"
                      >
                        已通过题解
                      </Link>
                      。
                    </>
                  )}
                </>
              )}
            </Text>
            <div className="adminCommit">
              <Text>管理员备注：</Text>
              <textarea
                defaultValue={details.article.adminComment}
                spellCheck="false"
              />
            </div>
          </>
        ) : undefined}
      </div>
      <div className="articleOperator">
        <Switch
          label="显示 MarkDown 源代码"
          checked={viewSourceCode}
          onChange={(e, x) => setViewSourceCode(x.checked)}
        />
        <Field label="其他原因：">
          <Textarea
            className="otherReasons"
            value={otherRefuseCommit}
            onChange={(e, x) => setOtherRefuseCommit(x.value)}
          />
        </Field>
        <Switch
          label="显示审核员身份"
          checked={showAdminInfo}
          onChange={(e, x) => setShowAdminInfo(x.checked)}
        />
        <Field label="预览：">
          <Text as="span" className="viewOperatorCommit">
            {details?.article ? (
              refuseCommit ? (
                <>
                  很遗憾，您的《
                  <Link
                    href={`https://www.luogu.com.cn/article/${details.article.lid}`}
                    target="_blank"
                  >
                    {details.article.title}
                  </Link>
                  》不符合推荐标准。原因是：{refuseCommit}。
                </>
              ) : (
                <>
                  恭喜，您的《
                  <Link
                    href={`https://www.luogu.com.cn/article/${details.article.lid}`}
                  >
                    {details.article.title}
                  </Link>
                  》已经被全站推荐，将在 1 小时内予以展示。
                </>
              )
            ) : (
              '无预览'
            )}
          </Text>
        </Field>
        <div className="submitButton">
          <Text as="span">队列中还有 {details?.count || 0} 篇文章。</Text>
          <Switch
            label="只审题解"
            checked={solutionOnly}
            onChange={(e, x) => setSolutionOnly(x.checked)}
          />
          <Button
            appearance="primary"
            disabled={!(details?.article && !status?.submiting)}
            onClick={() => submit()}
          >
            {!details?.article ? '暂无文章' : refuseCommit ? '拒绝' : '通过'}
          </Button>
          <Button
            appearance="secondary"
            onClick={() => updateArticle()}
            disabled={!details}
          >
            跳过
          </Button>
          <InfoLabel
            info={
              <Text>
                通过/拒绝/跳过后，获取的下一篇题解为提交时间
                <Text as="strong">大于</Text>该时间戳的第一篇。
              </Text>
            }
          >
            <Popover>
              <PopoverTrigger disableButtonEnhancement>
                <Button>按时间跳过</Button>
              </PopoverTrigger>
              <PopoverSurface className="jumpByTime-PopoverSurface">
                <InputDateTime
                  value={skipBefore}
                  onChange={x => setSkipBefore(x)}
                />
                <div>
                  <span>时间戳：</span>
                  <Input
                    type="number"
                    value={(skipBefore / 1000).toString()}
                    onChange={(e, { value: x }) => {
                      if (/^(\d|-)*$/.test(x)) setSkipBefore(Number(x) * 1000);
                    }}
                    min={0}
                  />
                </div>
                <Button
                  appearance="primary"
                  onClick={() => updateArticle()}
                  disabled={!details}
                >
                  跳过
                </Button>
              </PopoverSurface>
            </Popover>
          </InfoLabel>
        </div>
        <div className="submitButton">
          <Button
            appearance="transparent"
            icon={<HistoryDismiss32Filled />}
            onClick={() => setShowHistory(true)}
          />
        </div>
      </div>
      <>
        <Drawer
          open={showHistory}
          onOpenChange={(_, { open }) => setShowHistory(open)}
          position="end"
        >
          <DrawerHeader>
            <DrawerHeaderTitle
              action={
                <Button
                  appearance="subtle"
                  aria-label="Close"
                  icon={<Dismiss24Regular />}
                  onClick={() => setShowHistory(false)}
                />
              }
            >
              审核历史
            </DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody>
            <ArticleHistory />
          </DrawerBody>
        </Drawer>
      </>
    </div>
  ) : (
    <ErrorDiv
      err={fetchError}
      retry={() => (setFetchError(undefined), updateArticle())}
    />
  );
}
