## Example

```typescript
import {
  loadI18n,
  loadI18nWithNS,
  getI18n,
  useI18n,
  resolveNamespace,
} from '@i18n-macro'

// Load i18n yaml files with namespace according defaultLoadGlob in vite.config.ts
loadI18n()

// Load i18n yaml files with namespace according glob
loadI18n('./translations/*.yaml')

// Load i18n yaml files with namespace according defaultLoadGlob in vite.config.ts
// with manual specified namespace.
loadI18nWithNS()

// Load i18n yaml files with namespace according glob
// with manual specified namespace.
loadI18nWithNS('./translations/*.yaml')

// useTranslation() with auto namespace management, use it within React components.
useI18n()

// get i18next instance with auto namespace management, use it anywhere.
getI18n()

// get current namespace
resolveNamespace()
```

## Namespace Management

If translation file `/project/src/translations/zh.yaml` are loaded in `/project/src/comp.tsx`, the namespace will be
generated from `/project/src`.

Use `useI18n`, `getI18n` or `resolveNamespace` in file `/project/src/comp.tsx` or `/project/src/xxx/comp.tsx` (if `/project/src/xxx/comp.tsx` doesn't load i18n resources),
the generated namespace and global namespace will be injected automatically.
