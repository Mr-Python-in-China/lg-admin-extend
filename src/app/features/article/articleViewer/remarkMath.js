/*
 * Copyright © 2024 by Luogu
 */

import { mathFromMarkdown } from 'mdast-util-math';
import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding } from 'micromark-util-character';

export default function remarkMath(e) {
  const t = e || {},
    n = this.data(),
    a = n.micromarkExtensions || (n.micromarkExtensions = []),
    r = n.fromMarkdownExtensions || (n.fromMarkdownExtensions = []);
  a.push(u(t)), r.push(mathFromMarkdown());
}

const i = {
    tokenize: function (e, t, n) {
      const i = this.events[this.events.length - 1],
        s =
          i && 'linePrefix' === i[1].type
            ? i[2].sliceSerialize(i[1], !0).length
            : 0;
      let l,
        c = 0,
        u = 0;
      return function (t) {
        return e.enter('mathFlow'), e.enter('mathFlowFence'), f(t);
      };
      function f(t) {
        return 36 === t
          ? (e.consume(t), c++, f)
          : c < 2
            ? n(t)
            : (e.exit('mathFlowFence'), factorySpace(e, p, 'whitespace')(t));
      }
      function p(t) {
        return (s ? factorySpace(e, h, 'linePrefix', s + 1) : h)(t);
      }
      function h(t) {
        return null === t
          ? v(t)
          : markdownLineEnding(t)
            ? e.attempt(a, p, v)(t)
            : 36 === t
              ? ((l = e.enter('mathFlowFence')), (u = 0), m(t))
              : (e.enter('mathFlowValue'), d(t));
      }
      function d(t) {
        return 36 === t || null === t || markdownLineEnding(t)
          ? (e.exit('mathFlowValue'), h(t))
          : (e.consume(t), d);
      }
      function m(t) {
        return 36 === t
          ? (u++, e.consume(t), m)
          : u !== c
            ? ((l.type = 'mathFlowValue'), d(t))
            : factorySpace(e, g, 'whitespace')(t);
      }
      function g(t) {
        return null === t || markdownLineEnding(t)
          ? (e.exit('mathFlowFence'), v(t))
          : n(t);
      }
      function v(n) {
        return e.exit('mathFlow'), t(n);
      }
    },
    concrete: !0
  },
  a = {
    tokenize: function (e, t, n) {
      const r = this;
      return function (n) {
        return null === n
          ? t(n)
          : (e.enter('lineEnding'), e.consume(n), e.exit('lineEnding'), o);
      };
      function o(e) {
        return r.parser.lazy[r.now().line] ? n(e) : t(e);
      }
    },
    partial: !0
  };
function s(e) {
  let t = (e || {}).singleDollarTextMath;
  return (
    null == t && (t = !0),
    {
      tokenize: function (e, n, r) {
        let i,
          a,
          s = 0;
        return function (t) {
          return e.enter('mathText'), e.enter('mathTextSequence'), l(t);
        };
        function l(n) {
          return 36 === n
            ? (e.consume(n), s++, l)
            : s < 2 && !t
              ? r(n)
              : (e.exit('mathTextSequence'), c(n));
        }
        function c(t) {
          return null === t
            ? r(t)
            : 36 === t
              ? ((a = e.enter('mathTextSequence')), (i = 0), f(t))
              : 32 === t
                ? (e.enter('space'), e.consume(t), e.exit('space'), c)
                : markdownLineEnding(t)
                  ? (e.enter('lineEnding'),
                    e.consume(t),
                    e.exit('lineEnding'),
                    c)
                  : (e.enter('mathTextData'), u(t));
        }
        function u(t) {
          return null === t || 32 === t || 36 === t || markdownLineEnding(t)
            ? (e.exit('mathTextData'), c(t))
            : (e.consume(t), u);
        }
        function f(t) {
          return 36 === t
            ? (e.consume(t), i++, f)
            : i === s
              ? (e.exit('mathTextSequence'), e.exit('mathText'), n(t))
              : ((a.type = 'mathTextData'), u(t));
        }
      },
      resolve: l,
      previous: c
    }
  );
}
function l(e) {
  let t,
    n,
    r = e.length - 4,
    o = 3;
  if (
    !(
      ('lineEnding' !== e[o][1].type && 'space' !== e[o][1].type) ||
      ('lineEnding' !== e[r][1].type && 'space' !== e[r][1].type)
    )
  )
    for (t = o; ++t < r; )
      if ('mathTextData' === e[t][1].type) {
        (e[r][1].type = 'mathTextPadding'),
          (e[o][1].type = 'mathTextPadding'),
          (o += 2),
          (r -= 2);
        break;
      }
  for (t = o - 1, r++; ++t <= r; )
    void 0 === n
      ? t !== r && 'lineEnding' !== e[t][1].type && (n = t)
      : (t !== r && 'lineEnding' !== e[t][1].type) ||
        ((e[n][1].type = 'mathTextData'),
        t !== n + 2 &&
          ((e[n][1].end = e[t - 1][1].end),
          e.splice(n + 2, t - n - 2),
          (r -= t - n - 2),
          (t = n + 2)),
        (n = void 0));
  return e;
}
function c(e) {
  return (
    36 !== e ||
    'characterEscape' === this.events[this.events.length - 1][1].type
  );
}
function u(e) {
  return { flow: { 36: i }, text: { 36: s(e) } };
}
