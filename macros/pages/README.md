## Example

```typescript
import { loadRoutes, loadMenus, resolveRoute } from '@pages-macro'
import { IPageMeta } from 'xxx'

// Get a tree of pages, with auto-generated routes.
// The generic parameter determines the type of the default export
// of loaded meta files.
loadRoutes<IPageMeta>('./dir', '/route')

// Get a tree of menu items, with i18n names.
loadMenus('./dir')

// Get the route of the current file.
resolveRoute()

// Get the route of the specific file.
resolveRoute('./some/other/file')
```

## Route Management

TBD
