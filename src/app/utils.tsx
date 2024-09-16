import React, { memo, useEffect, useState } from 'react';

import { UserSummary } from 'luogu-api';
import { isError } from 'lodash';
import { isAxiosError, isCancel } from 'axios';
import { Button, tokens, Input, Link } from '@fluentui/react-components';
import dayjs from 'dayjs';
import { DismissCircleRegular } from '@fluentui/react-icons';
import { getProblemData } from '../fetch';
import { UsernameColor, DifficultyColor } from '../constants';

export type Override<P, S> = Omit<P, keyof S> & S;

export function UserName({ children }: { children: UserSummary }) {
  return (
    <a
      className="username"
      href={`https://www.luogu.com.cn/user/${children.uid}`}
      target="_blank"
      style={{
        color: UsernameColor[children.color as keyof typeof UsernameColor]
      }}
    >
      <>{children.name}</>
      {children.ccfLevel > 2 && (
        <span style={{ marginLeft: '4px' }}>
          <CcfLevelSvg level={children.ccfLevel} />
        </span>
      )}
      {children.badge && (
        <span
          className="username-badge"
          style={{
            backgroundColor:
              UsernameColor[children.color as keyof typeof UsernameColor],
            borderColor:
              UsernameColor[children.color as keyof typeof UsernameColor],
            marginLeft: '4px'
          }}
        >
          {children.badge}
        </span>
      )}
    </a>
  );
}

export function CcfLevelSvg({ level }: { level: number }) {
  return level <= 2 ? (
    <></>
  ) : (
    <svg
      aria-hidden="true"
      focusable="false"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      height="1em"
    >
      <g>
        <path
          fill={
            level <= 5
              ? 'rgb(94, 185, 94)'
              : level <= 7
                ? 'rgb(52, 152, 219)'
                : 'rgb(241, 196, 15)'
          }
          d="M256 0c36.8 0 68.8 20.7 84.9 51.1C373.8 41 411 49 437 75s34 63.3 23.9 96.1C491.3 187.2 512 219.2 512 256s-20.7 
              68.8-51.1 84.9C471 373.8 463 411 437 437s-63.3 34-96.1 23.9C324.8 491.3 292.8 512 256 512s-68.8-20.7-84.9-51.1C138.2 
              471 101 463 75 437s-34-63.3-23.9-96.1C20.7 324.8 0 292.8 0 256s20.7-68.8 51.1-84.9C41 138.2 49 101 75 75s63.3-34 
              96.1-23.9C187.2 20.7 219.2 0 256 0zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 
              111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z
            "
        ></path>
        <path
          fill="white"
          d="M369 175c9.4 9.4 9.4 24.6 0 33.9L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 
              0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0z
            "
        ></path>
      </g>
    </svg>
  );
}

export function ErrorDiv({
  err,
  retry
}: {
  err: Exclude<unknown, undefined>;
  className?: string;
  retry?: () => void;
}) {
  const errorText = isError(err)
    ? isAxiosError(err)
      ? '网络请求错误：' + (err.response?.data.errorMessage || err.message)
      : err.message
    : '未知错误';
  return (
    <div className="errorDiv">
      <DismissCircleRegular
        fontSize="60px"
        color={tokens.colorStatusDangerBackground3}
      />
      <span>{errorText}</span>
      <Button onClick={retry && (() => retry())} appearance="primary">
        重试
      </Button>
    </div>
  );
}

export function InputDateTime(
  props: Override<
    Parameters<typeof Input>[0],
    {
      value: number;
      onChange: (v: number) => void;
    }
  >
) {
  return (
    <Input
      {...props}
      type="datetime-local"
      value={dayjs(props.value).format('YYYY-MM-DDTHH:mm:ss')}
      onChange={(e, { value: x }) => {
        if (!x) return;
        const nd = new Date(x);
        props.onChange(nd.getTime());
      }}
      step="1"
    />
  );
}

export const ProblemNameWithDifficulty = memo(
  ({
    pid,
    name,
    difficulty
  }: {
    pid: string;
    name?: string;
    difficulty?: number;
  }) => {
    const Res = ({
      pid,
      name,
      difficulty
    }: {
      pid: string;
      name?: string;
      difficulty?: number;
    }) => {
      const [difficultyState, setDifficultyState] = useState<
        number | undefined
      >(difficulty);
      const [nameState, setNameState] = useState<string | undefined>(name);
      useEffect(() => {
        if (difficultyState !== undefined && nameState !== undefined) return;
        const cancel = new AbortController();
        getProblemData(pid, { signal: cancel.signal })
          .then(data => {
            if (difficultyState === undefined)
              setDifficultyState(data.currentData.problem.difficulty);
            if (nameState === undefined)
              setNameState(data.currentData.problem.title);
          })
          .catch(e => {
            if (isCancel(e)) return;
            console.error('Error when fetch problem data', e);
          });
        return () => cancel.abort();
      }, []);
      return (
        <Link href={'https://www.luogu.com.cn/problem/' + pid} target="_blank">
          <span
            style={
              difficultyState !== undefined
                ? {
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: DifficultyColor[difficultyState]
                  }
                : undefined
            }
          >
            {pid}
          </span>
          {nameState !== undefined && ' ' + nameState}
        </Link>
      );
    };
    return <Res pid={pid} difficulty={difficulty} name={name} key={pid} />;
  }
);

export const formatTime = (time: number | Date) =>
  dayjs(time).format('YYYY-MM-DD HH:mm:ss');
