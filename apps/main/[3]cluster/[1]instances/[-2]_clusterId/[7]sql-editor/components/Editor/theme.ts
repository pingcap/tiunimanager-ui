import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'

export const bbedit = createTheme({
  theme: 'light',
  settings: {
    background: '#FFFFFF',
    foreground: '#000000',
    caret: '#009AE5',
    selection: '#0ca6f21a',
    selectionMatch: '#F1FAFE',
    gutterBackground: '#ffffff',
    gutterForeground: '#999',
    lineHighlight: '#0ca6f20d',
  },
  styles: [
    {
      tag: [t.meta, t.comment],
      color: '#3BAF6D',
    },
    {
      tag: [t.keyword, t.strong],
      color: '#009AE6',
    },
    {
      tag: [t.number],
      color: '#EB4799',
    },
    {
      tag: [t.string],
      color: '#EB4799',
    },
    {
      tag: [t.variableName],
      color: '#056142',
    },
    {
      tag: [t.escape],
      color: '#40BF6A',
    },
    {
      tag: [t.tagName],
      color: '#2152C4',
    },
    {
      tag: [t.heading],
      color: '#2152C4',
    },
    {
      tag: [t.quote],
      color: '#333333',
    },
    {
      tag: [t.list],
      color: '#C20A94',
    },
    {
      tag: [t.documentMeta],
      color: '#999999',
    },
    {
      tag: [t.function(t.variableName)],
      color: '#1A0099',
    },
    {
      tag: [t.definition(t.typeName), t.typeName],
      color: '#6D79DE',
    },
  ],
})
