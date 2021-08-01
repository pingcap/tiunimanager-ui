declare module '@i18n-macro' {
  export function load(glob: string, cwd?: string): void
  export function useI18n(): import('react-i18next').UseTranslationResponse<'type placeholder'>
}
