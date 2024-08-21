import React, { useEffect, useState } from 'react';
import {
  FluentProvider,
  webLightTheme,
  Image,
  Spinner,
  Theme
} from '@fluentui/react-components';
import { UserSummary } from 'luogu-api';
import { fetchMyInfo } from '../fetch';
import { MyInfoContext } from './contexts';
import { ErrorDiv } from './utils';

import Features from './features';

import './style.css';

const theme: Theme = {
  ...webLightTheme,
  colorBrandForegroundLink: '#3498db',
  colorBrandForegroundLinkHover: '#0056b3'
};

export default function App() {
  const [nowFeature, setNowFeature] = useState<number>(0);
  const NowFeatureComponent =
    nowFeature >= 0 ? Features[nowFeature][1] : React.Fragment;

  const [myInfo, setMyInfo] = useState<UserSummary | null>(null);
  const [fetchError, setFetchError] = useState<unknown | undefined>(undefined);
  useEffect(() => {
    let ignore = false;
    fetchMyInfo()
      .then(x => {
        if (!ignore) setMyInfo(x);
      })
      .catch(e => {
        if (!ignore) console.error('Error in App', e), setFetchError(e);
      });
    return () => void (ignore = true);
  }, []);
  useEffect(() => {
    if (nowFeature < 0) setNowFeature(-nowFeature - 1);
  });

  return (
    <FluentProvider theme={theme}>
      <div className="root">
        {!fetchError ? (
          <>
            <nav>
              <a href="https://www.luogu.com.cn" style={{ marginRight: '1em' }}>
                <Image
                  src="https://fecdn.luogu.com.cn/luogu/logo.png"
                  alt="Luogu logo"
                  style={{ height: '3em', marginLeft: '1em' }}
                />
              </a>
              <div
                style={{
                  marginLeft: '0.5em',
                  marginRight: '0.5em',
                  backgroundColor: '#7f7f7f',
                  height: '2em',
                  width: '2px'
                }}
              />
              <div>
                {Features.map((s, i) => (
                  <button
                    type="button"
                    onClick={() => setNowFeature(-i - 1)}
                    key={i}
                    className="nav-item"
                    style={{ fontWeight: nowFeature === i ? 'bold' : 'normal' }}
                    tabIndex={0}
                  >
                    {s[0]}
                  </button>
                ))}
              </div>
            </nav>
            {myInfo ? (
              <div className="feature">
                <MyInfoContext.Provider value={myInfo}>
                  <NowFeatureComponent />
                </MyInfoContext.Provider>
              </div>
            ) : (
              <Spinner size="huge" className="feature" />
            )}
          </>
        ) : (
          <ErrorDiv err={fetchError} retry={() => {}} />
        )}
      </div>
    </FluentProvider>
  );
}
