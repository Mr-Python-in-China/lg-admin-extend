import { Element } from 'hast';

function genTitle(title: string) {
  return `可能存在的问题：${title}`;
}

export const Space: Element = {
  type: 'element',
  tagName: 'span',
  properties: { className: ['articleHighlight', 'Space'] },
  children: [{ type: 'text', value: ' ' }]
};

export const NeedSpaceBetweenEnglishCharAndChineseCharNote =
  '【中文】与【英文】字符间需要用空格隔开';
export const NeedSpaceBetweenEnglishCharAndChineseChar: Element = {
  type: 'element',
  tagName: 'span',
  properties: {
    className: [
      'articleHighlight',
      'NeedSpaceBetweenPunctuationAndChineseChar'
    ],
    title: genTitle(NeedSpaceBetweenEnglishCharAndChineseCharNote)
  },
  children: [
    {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: []
    }
  ]
};
