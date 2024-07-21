import { SolutionAdminInfo } from '../../../interface';
import React, { useEffect, useRef, useState } from 'react';
import { ArctleViewer } from './articleViewer';
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
  Label
} from '@fluentui/react-components';
import { getArticle, submitArticleCheckResult } from '../../../fetch';
import { ErrorDiv, InputDateTime, UserName } from '../../utils';
import dayjs from 'dayjs';
import emptyQueueImage from 'assets/emptyQueue.webp';
import './style.css';
import { useNotUndefinedContext } from '../../../notUndefinedContext';
import { MyInfoContext } from '../../contexts';

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
  const myProfile = useNotUndefinedContext(MyInfoContext);

  let refuseCommit = otherRefuseCommit;
  if (refuseCommit)
    if (showAdminInfo)
      refuseCommit += `。审核管理员：${myProfile.name}，对审核结果有疑问请私信交流`;

  useEffect(() => {
    let ignore = false;
    getArticle(skipBefore / 1000)
      .then(v => {
        if (!ignore)
          setStatus({ details: v }),
            v.article && setSkipBefore(v.article.promoteResult.updateAt * 1000);
      })
      .catch(e => {
        if (!ignore)
          console.error('Error in feature Article', e), setFetchError(e);
      });
    return () => void (ignore = true);
  }, []);
  function updateArticle() {
    setStatus(null);
    getArticle(skipBefore / 1000)
      .then(v => {
        setStatus({ details: v });
        setOtherRefuseCommit('');
        if (v.article) setSkipBefore(v.article.promoteResult.updateAt * 1000);
      })
      .catch(
        e => (console.error('Error in feature Article', e), setFetchError(e))
      );
  }
  async function submit() {
    if (!details?.article) throw new Error('No article');
    setStatus({ details: details, submiting: true });
    await submitArticleCheckResult([details.article.lid, refuseCommit || true]);
    setStatus(null);
    updateArticle();
  }

  return !fetchError ? (
    <div className="articleFeature">
      {details ? (
        details.article ? (
          <ArctleViewer className="articleViewer">
            {details.article.content}
          </ArctleViewer>
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
              {dayjs(details.article.time * 1000).format('YYYY/MM/DD HH:mm:ss')}
              {details.article.promoteResult.updateAt &&
                '，提交于 ' +
                  dayjs(details.article.promoteResult.updateAt * 1000).format(
                    'YYYY/MM/DD HH:mm:ss'
                  )}
              。文章 LID：
              <a
                href={`https://www.luogu.com.cn/article/${details.article.lid}`}
                target="_blank"
              >
                {details.article.lid}
              </a>
            </Text>
            {details.article.solutionFor && (
              <Text>
                关联于题目{' '}
                <a
                  href={`https://www.luogu.com.cn/problem/${details.article.solutionFor.pid}`}
                  target="_blank"
                >
                  {details.article.solutionFor.pid}{' '}
                  {details.article.solutionFor.title}
                </a>
                。
                {details.countForProblem && (
                  <>
                    共有 {details.countForProblem.pending} 篇待审核题解，
                    {details.countForProblem.available} 篇
                    <a
                      href={`https://www.luogu.com.cn/problem/solution/${details.article.solutionFor.pid}`}
                      target="_blank"
                    >
                      已通过题解
                    </a>
                    。
                  </>
                )}
              </Text>
            )}
            <div className="adminCommit">
              <Text>管理员备注：</Text>
              <textarea defaultValue={details.article.adminComment} />
            </div>
          </>
        ) : undefined}
      </div>
      <div className="articleOperator">
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
          onChange={(e, x) => setShowAdminInfo(!!x.checked)}
        />
        <Field label="预览：">
          <Text as="span" className="viewOperatorCommit">
            {details?.article ? (
              refuseCommit ? (
                <>
                  很遗憾，您的《
                  <Link
                    href={`https://www.luogu.com.cn/article/${details.article.lid}`}
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
          <Button
            appearance="primary"
            disabled={!details?.article}
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
      </div>
    </div>
  ) : (
    <ErrorDiv
      err={fetchError}
      retry={() => (setFetchError(undefined), updateArticle())}
    />
  );
}
