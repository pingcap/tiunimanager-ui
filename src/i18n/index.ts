/*
 * Copyright 2022 PingCAP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next, useTranslation } from 'react-i18next'
import { createElement, FC } from 'react'
import { ConfigProvider } from 'antd'
import enUS from 'antd/lib/locale/en_US'
import zhCN from 'antd/lib/locale/zh_CN'
import { Locale } from 'antd/lib/locale-provider'

export interface LanguageProp {
  // display name
  display: string
  // BCP 47 tag name
  tag: string
}

export type LanguageID = 'en' | 'zh'
export const LANGUAGE_IDS: LanguageID[] = ['en', 'zh']

export const LANGUAGES: Record<LanguageID, LanguageProp> = {
  en: {
    display: 'English',
    tag: 'en',
  },
  zh: {
    display: '简体中文',
    tag: 'zh-cmn-Hans',
  },
}

export type NestedRecord = { [key: string]: NestedRecord } | string

export function loadTranslations(
  t: Record<string, { [key: string]: NestedRecord }>,
  namespace = 'translation'
) {
  onI18nInitialized(() =>
    Object.keys(t).forEach((lang) => {
      if (!LANGUAGE_IDS.includes(lang as any)) return
      i18next.addResourceBundle(lang, namespace, t[lang], true, false)
    })
  )
}

// Ensure hook will be called after i18next is initialized.
export function onI18nInitialized(hook: () => any) {
  if (i18next.isInitialized) hook()
  else i18next.on('initialized', hook)
}

export async function init() {
  !i18next.isInitialized &&
    (await i18next
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources: {},
        fallbackLng: LANGUAGE_IDS[0],
        whitelist: LANGUAGE_IDS,
        interpolation: {
          escapeValue: false,
        },
        detection: {
          lookupQuerystring: 'lang',
          lookupCookie: 'lang',
          lookupLocalStorage: 'lang',
          lookupSessionStorage: 'lang',
        },
      }))
}

const AntdLocaleMap: Record<string, Locale> = {
  en: enUS,
  zh: zhCN,
}

export const AntdI18nProvider: FC = ({ children }) => {
  const { i18n } = useTranslation()
  return createElement(
    ConfigProvider,
    { locale: AntdLocaleMap[i18n.language] },
    children
  )
}
