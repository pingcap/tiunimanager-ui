import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

export interface LanguageProp {
  // display name
  display: string
  // BCP 47 tag name
  tag: string
}

type LanguageID = 'en' | 'zh'
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

export type TranslationEntry = Record<LanguageID, string>

export function loadTranslationEntry(
  t: TranslationEntry,
  name: string,
  ns = 'translation'
) {
  onI18nInitialized(() =>
    Object.keys(t).forEach((key) =>
      i18next.addResource(key, ns, name, t[key as LanguageID])
    )
  )
}

// Ensure hook will be called after i18next is initialized.
export function onI18nInitialized(hook: () => any) {
  if (i18next.isInitialized) hook()
  else onInitializedHooks.push(hook)
}

const onInitializedHooks: (() => any)[] = []

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
      })
      .then(() => {
        onInitializedHooks.forEach((h) => h())
        onInitializedHooks.length = 0
      }))
}

export async function toggleLang(
  target: (cur: LanguageID) => LanguageID
): Promise<void>
export async function toggleLang(target: LanguageID): Promise<void>
export async function toggleLang(target: unknown) {
  let lang: LanguageID
  switch (typeof target) {
    case 'string':
      lang = target as LanguageID
      break
    case 'function':
      lang = target(i18next.language)
      break
    default:
      return
  }
  if (!LANGUAGE_IDS.includes(lang)) return
  await i18next.changeLanguage(lang, (err) => {
    if (!err) document.documentElement.lang = LANGUAGES[lang].tag
  })
  return
}
